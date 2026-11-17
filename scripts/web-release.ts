// Finishes a web export (apps/app/dist) for Workers Static Assets
// (apps/app/wrangler.jsonc):
//
// - 404.html, the not-found page, which Workers serves with a 404 for any
//   unknown path.
// - _headers. Files whose names carry their content's hash (_expo/static,
//   assets) are cached for a year as immutable, each by its own rule: a rule
//   with * would also mark the 404 page served for a missing one immutable.
//   Loaders (_expo/loaders) are JSON. Everything else (pages, loaders,
//   content/, the sitemap) keeps Workers' default, public, max-age=0,
//   must-revalidate, so a new deploy shows at once.
//
// With --remote-audio, for release builds, it also checks that the export
// holds no audio and that the pages' og:audio points at audio.shawared.com.
//
//   bun scripts/web-release.ts [--remote-audio]
import { copyFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { AUDIO_HOST, IMMUTABLE, root, SITE } from "./recordings.ts";

// Cloudflare reads at most 100 rules from _headers.
export const MAX_RULES = 100;
const HASHED_DIRS = ["_expo/static", "assets"];
const HASH = /[0-9a-f]{32}/;
const AUDIO_FILE = /\.(m4a|mp3|aac|ogg|opus|wav|flac)$/i;

function* files(dir: string): Generator<string> {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, e.name);
    if (e.isDirectory()) yield* files(path);
    else yield path;
  }
}

const urlPath = (dist: string, file: string) => "/" + relative(dist, file).split(sep).map(encodeURIComponent).join("/");

export function headersFor(dist: string): { text: string; hashed: number } {
  const hashed: string[] = [];
  const unhashed: string[] = [];
  for (const dir of HASHED_DIRS) {
    if (!existsSync(join(dist, dir))) continue;
    for (const file of files(join(dist, dir))) (HASH.test(file.split(sep).pop()!) ? hashed : unhashed).push(file);
  }
  if (unhashed.length) {
    throw new Error(
      `files without a content hash in their names, which can't be cached as immutable: ${unhashed.map((f) => relative(dist, f)).join(", ")}`,
    );
  }
  const rules = [
    "/_expo/loaders/*\n  Content-Type: application/json; charset=utf-8",
    ...hashed
      .map(urlPath.bind(null, dist))
      .sort()
      .map((path) => `${path}\n  Cache-Control: ${IMMUTABLE}`),
  ];
  if (rules.length > MAX_RULES) {
    throw new Error(
      `${rules.length} header rules, over Cloudflare's ${MAX_RULES}: cache the hashed files another way, such as a Worker in front of the assets`,
    );
  }
  return { text: `${rules.join("\n\n")}\n`, hashed: hashed.length };
}

export function remoteAudioProblems(dist: string): string[] {
  const problems: string[] = [];
  for (const file of files(dist)) {
    const rel = relative(dist, file);
    if (AUDIO_FILE.test(file) || rel.split(sep)[0] === "audio") problems.push(`${rel} is audio, which comes from ${AUDIO_HOST}`);
    else if (file.endsWith(".html") && readFileSync(file, "utf8").includes(`${SITE}/audio/`)) {
      problems.push(`${rel} links audio on ${SITE}/audio/ instead of ${AUDIO_HOST}`);
    }
  }
  return problems;
}

if (import.meta.main) {
  const dist = join(root(), "apps/app/dist");
  if (!existsSync(dist) || !statSync(dist).isDirectory()) throw new Error(`${dist} doesn't exist: export the web first`);
  copyFileSync(join(dist, "+not-found.html"), join(dist, "404.html"));
  const { text, hashed } = headersFor(dist);
  writeFileSync(join(dist, "_headers"), text);
  console.log(`web: 404.html, and immutable caching for ${hashed} hashed files`);
  if (process.argv.includes("--remote-audio")) {
    const problems = remoteAudioProblems(dist);
    if (problems.length) {
      console.error(`the release build isn't ready:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
      process.exit(1);
    }
    console.log(`web: no audio in the export; pages link audio on ${AUDIO_HOST}`);
  }
}
