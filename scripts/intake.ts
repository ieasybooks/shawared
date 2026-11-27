// Takes a recording in: downloads its audio, makes the 16 kHz copy the speech tools read,
// maps its silences, measures its loudness and transcribes it. Every step is skipped when
// its output already exists, so it can be run again safely.
//
//   bun scripts/intake.ts <youtube-url-or-id>... [--no-asr]
//
// Writes media/sources/<id>.<ext> and media/work/<id>/{audio16k.wav, intake.json, asr/}.
// The transcript shows which abyat the reciter says, in what order, and what lies around
// the poem (talk, music, credits) for scripts/audio.ts to leave out.
//
// Set TAFRIGH to another tafrigh binary (a CUDA build, say) to use it instead of tafrigh-rs.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { media, run, loudness, silences, fmtTime } from "./media.ts";

const args = process.argv.slice(2);
const asr = !args.includes("--no-asr");
const inputs = args.filter((a) => !a.startsWith("--"));
if (inputs.length === 0) {
  console.error("usage: bun scripts/intake.ts <youtube-url-or-id>... [--no-asr]");
  process.exit(1);
}

const idOf = (s: string) => {
  const m = /(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/.exec(s);
  if (m) return m[1]!;
  if (/^[\w-]{11}$/.test(s)) return s;
  throw new Error(`not a YouTube link or id: ${s}`);
};

for (const input of inputs) {
  const id = idOf(input);
  const url = `https://www.youtube.com/watch?v=${id}`;
  const sources = join(media, "sources");
  const work = join(media, "work", id);
  mkdirSync(sources, { recursive: true });
  mkdirSync(work, { recursive: true });
  console.log(`\n== ${id}`);

  // Only the audio: the app never shows the video.
  const MEDIA_EXT = /\.(webm|m4a|mp4|mkv|opus|ogg|mp3|wav)$/;
  const existing = () => readdirSync(sources).find((f) => f.startsWith(`${id}.`) && MEDIA_EXT.test(f));
  if (!existing()) {
    run("uvx", [
      "--from",
      "yt-dlp[default]",
      "yt-dlp",
      "-q",
      "--no-warnings",
      "-f",
      "ba",
      "--write-info-json",
      "-o",
      join(sources, "%(id)s.%(ext)s"),
      "--",
      url,
    ]);
  }
  const src = join(sources, existing()!);
  const info = JSON.parse(readFileSync(join(sources, `${id}.info.json`), "utf8"));

  // The transcriber and aligner read mono 16 kHz audio.
  const wav = join(work, "audio16k.wav");
  if (!existsSync(wav)) run("ffmpeg", ["-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", wav]);

  const quiet = silences(wav);
  const loud = loudness(src);
  const duration = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).trim());

  const asrDir = join(work, "asr");
  if (asr && !existsSync(join(asrDir, "audio16k.json"))) {
    run(process.env.TAFRIGH ?? "tafrigh-rs", [wav, "--transcriber", "cohere", "-q", "-f", "txt,json", "-o", asrDir]);
  }

  const intake = {
    id,
    url,
    title: info.title,
    channel: info.channel,
    uploaded: info.upload_date,
    source: src.slice(media.length + 1),
    duration: Math.round(duration * 1000) / 1000,
    loudness: loud,
    silences: quiet,
  };
  writeFileSync(join(work, "intake.json"), JSON.stringify(intake, null, 1) + "\n");

  console.log(`${info.title}\n${fmtTime(duration)}  ·  ${loud.integrated} LUFS  ·  peak ${loud.peak} dBTP`);
  const long = quiet.filter(([a, b]) => b - a >= 2.5);
  if (long.length) console.log(`silences of 2.5 s or more: ${long.map(([a, b]) => `${fmtTime(a)}–${fmtTime(b)}`).join(", ")}`);
  const txt = join(asrDir, "audio16k.txt");
  if (existsSync(txt)) console.log(`transcript: ${txt.slice(media.length - 5)}`);
}
