// Makes a recording's app audio from its download: only the stretches that belong to the
// poem, one channel, set to the library's loudness with a plain gain, AAC at 96 kbps.
//
//   bun scripts/audio.ts <work-id> <poem>/<recitation> [--keep 3.2-95.1,101.4-410.5]
//
// --keep lists the stretches of the download to keep, in seconds; leave it out to keep
// everything. Leave out what isn't the poem: music and talk before or after it, and the
// silence where the editor cut abyat out. Each join gets a 20 ms fade so it doesn't click.
//
// Writes media/audio/<poem>/<recitation>.m4a, plus media/work/<id>/app16k.wav (the app
// audio as the aligner reads it, so timings match what the app plays) and audio.json.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CEILING_DBTP, TARGET_LUFS, loudness, media, monoFilter, run } from "./media.ts";

const [workId, target, ...rest] = process.argv.slice(2);
if (!workId || !target || !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(target)) {
  console.error("usage: bun scripts/audio.ts <work-id> <poem>/<recitation> [--keep a-b,c-d]");
  process.exit(1);
}
const keepArg = rest[rest.indexOf("--keep") + 1];
const work = join(media, "work", workId);
const intake = JSON.parse(readFileSync(join(work, "intake.json"), "utf8"));
const src = join(media, intake.source);

const keep: [number, number][] = rest.includes("--keep")
  ? keepArg!.split(",").map((s) => {
      const [a, b] = s.split("-").map(Number);
      if (!(a! >= 0 && b! > a! && b! <= intake.duration + 0.05)) throw new Error(`bad stretch ${s}`);
      return [a!, b!];
    })
  : [[0, intake.duration]];
keep.forEach(([a], i) => {
  if (i > 0 && a < keep[i - 1]![1]) throw new Error("stretches must be in order and not overlap");
});

// 1. The kept stretches, joined, as one channel.
const FADE = 0.02;
const parts = keep.map(([a, b], i) => {
  const len = b - a;
  const fades = keep.length > 1 ? `,afade=t=in:d=${FADE},afade=t=out:st=${(len - FADE).toFixed(3)}:d=${FADE}` : "";
  return `[0:a]atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS${fades}[p${i}]`;
});
const joined = `${parts.join(";")};${keep.map((_, i) => `[p${i}]`).join("")}concat=n=${keep.length}:v=0:a=1,${monoFilter(src)}[out]`;
const wav = join(work, "app48k.wav");
run("ffmpeg", ["-v", "error", "-y", "-i", src, "-filter_complex", joined, "-map", "[out]", "-ar", "48000", wav]);

// 2. One gain for the whole file: to the target, unless the peaks would pass the ceiling.
const before = loudness(wav);
const gain = Math.round(Math.min(TARGET_LUFS - before.integrated, CEILING_DBTP - before.peak) * 10) / 10;

// 3. The app file, and the copy the aligner reads, decoded from it.
const out = join(media, "audio", `${target}.m4a`);
mkdirSync(dirname(out), { recursive: true });
run("ffmpeg", ["-v", "error", "-y", "-i", wav, "-af", `volume=${gain}dB`, "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out]);
rmSync(wav);
const after = loudness(out);
const app16k = join(work, "app16k.wav");
run("ffmpeg", ["-v", "error", "-y", "-i", out, "-ac", "1", "-ar", "16000", app16k]);
const duration = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).trim());

const record = { target, keep, gain, before, after, duration };
writeFileSync(join(work, "audio.json"), JSON.stringify(record, null, 1) + "\n");
console.log(`${target}.m4a  ·  ${duration.toFixed(2)} s  ·  gain ${gain} dB  ·  ${after.integrated} LUFS  ·  peak ${after.peak} dBTP`);
if (after.integrated < TARGET_LUFS - 1.5)
  console.log(`quieter than ${TARGET_LUFS} LUFS: its peaks reach the ${CEILING_DBTP} dBTP ceiling first`);
if (!existsSync(app16k)) process.exit(1);
