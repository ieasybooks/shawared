// Silent stand-ins for the recordings, of each one's length, at its key under
// media/test-audio, for the browser tests where the real recordings aren't (CI
// never has them). scripts/serve-test-audio.ts serves them as
// audio.shawared.com serves the real ones, to a test build that plays audio from
// there (bun run web:build:test). It leaves a stand-in that's already there
// alone. Needs ffmpeg.
//
//   bun scripts/test-audio.ts
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { recordings } from "./recordings.ts";
import { root } from "./repository.ts";

export const TEST_AUDIO = join(root(), "media/test-audio");

if (import.meta.main) {
  let made = 0;
  for (const r of recordings(root())) {
    const file = join(TEST_AUDIO, r.audio);
    if (existsSync(file)) continue;
    mkdirSync(dirname(file), { recursive: true });
    const ffmpeg = spawnSync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=44100:cl=mono",
        "-t",
        String(r.duration),
        "-c:a",
        "aac",
        "-b:a",
        "32k",
        "-y",
        file,
      ],
      { stdio: "inherit" },
    );
    if (ffmpeg.status !== 0) throw new Error(`ffmpeg couldn't make ${file}`);
    made++;
  }
  console.log(`test audio: ${made} silent recording${made === 1 ? "" : "s"} made in ${TEST_AUDIO}`);
}
