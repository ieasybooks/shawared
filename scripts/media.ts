// Shared helpers for the scripts that handle recordings (intake.ts, audio.ts).
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { root } from "./repository.ts";

export const media = join(root(), "media");

/** Every recording in the app is set to this loudness, unless its peaks would pass the ceiling. */
export const TARGET_LUFS = -20;
export const CEILING_DBTP = -1;

/** How many audio channels a file has. */
export function channels(file: string): number {
  return Number(
    run("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels", "-of", "csv=p=0", file]).trim(),
  );
}

/** The filter that mixes a file's two channels evenly into one; a mono file passes as it
 *  is (upmixing it first would cost 3 dB and skew every measurement). */
export const monoFilter = (file: string) => (channels(file) >= 2 ? "pan=mono|c0=0.5*c0+0.5*c1" : "anull");

/** Runs a command and returns its stdout; stops the script when it fails. */
export function run(cmd: string, args: string[]): string {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) {
    console.error(`${cmd} ${args.join(" ")}\n${r.stderr || r.error?.message}`);
    process.exit(1);
  }
  return r.stdout + r.stderr;
}

const num = (s: string | undefined) => (s === undefined ? NaN : Number.parseFloat(s));

/** Integrated loudness (LUFS) and true peak (dBTP) of a file, as one mono channel. */
export function loudness(file: string) {
  const out = run("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-i",
    file,
    "-vn",
    "-af",
    `${monoFilter(file)},ebur128=peak=true`,
    "-f",
    "null",
    "-",
  ]);
  const summary = out.slice(out.lastIndexOf("Summary:"));
  return {
    integrated: num(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]),
    peak: num(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1]),
  };
}

/** Stretches below -35 dB that last at least `min` seconds, as [start, end]. */
export function silences(file: string, min = 0.4): [number, number][] {
  const out = run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", `silencedetect=noise=-35dB:d=${min}`, "-f", "null", "-"]);
  const starts = [...out.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => num(m[1]));
  const ends = [...out.matchAll(/silence_end: ([\d.]+)/g)].map((m) => num(m[1]));
  return starts.map((s, i) => [Math.max(0, Math.round(s * 1000) / 1000), Math.round((ends[i] ?? s) * 1000) / 1000]);
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
