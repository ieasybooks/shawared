// A recording's two names.
//
// - Its source: media/audio/<poem>/<recitation>.m4a, on the Mac that has the
//   recordings (media/ is gitignored). Always this path, whatever the content
//   says.
// - Its key: the recitation's `audio` field. Before the recording is uploaded
//   it's <poem>/<recitation>.m4a. `bun run audio:upload` uploads it to
//   audio.shawared.com under <poem>/<recitation>.<hash>.m4a, where <hash> is the
//   first 12 hex digits of the source's SHA-256, and writes that key in. A key
//   never takes other bytes, so audio.shawared.com caches it as immutable; a new
//   recording gets a new key.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const AUDIO_HOST = "https://audio.shawared.com";
export const SITE = "https://shawared.com";
export const CONTENT_TYPE = "audio/mp4";
export const IMMUTABLE = "public, max-age=31536000, immutable";

const KEY = /^([a-z0-9-]+)\/([a-z0-9-]+)(?:\.([0-9a-f]{12}))?\.m4a$/;

export type Key = { poem: string; recitation: string; hash?: string };

export function parseKey(key: string): Key | null {
  const m = KEY.exec(key);
  if (!m) return null;
  return { poem: m[1]!, recitation: m[2]!, ...(m[3] ? { hash: m[3] } : {}) };
}

/** The repository root: SHAWARED_ROOT, for the scripts' tests, or this checkout. */
export const root = (): string => process.env.SHAWARED_ROOT ?? join(import.meta.dir, "..");

export const sourcePath = (rootDir: string, poem: string, recitation: string) => join(rootDir, "media", "audio", poem, `${recitation}.m4a`);

export const hashOf = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex").slice(0, 12);

export const keyFor = (poem: string, recitation: string, bytes: Uint8Array): string => `${poem}/${recitation}.${hashOf(bytes)}.m4a`;

export type Recording = {
  poem: string;
  recitation: string;
  /** The recitation's JSON file. */
  file: string;
  /** Its `audio` field. */
  audio: string;
  duration: number;
};

const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory();

/** Every recitation under content/poems, in order. */
export function recordings(rootDir: string): Recording[] {
  const poems = join(rootDir, "content", "poems");
  const found: Recording[] = [];
  for (const poem of isDir(poems) ? readdirSync(poems).sort() : []) {
    const dir = join(poems, poem, "recitations");
    for (const f of isDir(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith(".json"))
          .sort()
      : []) {
      const file = join(dir, f);
      const json = JSON.parse(readFileSync(file, "utf8")) as { audio: string; duration: number };
      found.push({ poem, recitation: f.replace(/\.json$/, ""), file, audio: json.audio, duration: json.duration });
    }
  }
  return found;
}
