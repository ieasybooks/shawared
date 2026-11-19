// Finishes a web export (apps/app/dist) for Workers Static Assets
// (apps/app/wrangler.jsonc):
//
// - 404.html, the not-found page, which Workers serves with a 404 for any
//   unknown path.
// - en.html, from en/index.html: Workers serves /x from x.html, but redirects
//   /x to /x/ when the page is x/index.html, and the sitemap and the pages'
//   canonical links name /en.
// - Asset addresses. Cloudflare answers an address with @ or + with a redirect
//   to its percent-encoded form, a round trip before each font, so the export
//   names its assets by plain addresses (apps/app/plugins/plain-asset-paths.js,
//   in Metro, before the scripts' names take their content's hash). It fails if
//   a page, script or style sheet still names an asset by an address that
//   would be encoded.
// - Font preloads. Expo preloads every face the app loads, on every page. A page
//   keeps the preloads of the faces its markup draws with (English on an Arabic
//   page has none); the others load when the app asks for them.
// - _headers. Files whose names carry their content's hash (_expo/static,
//   assets) are cached for a year as immutable, each by its own rule: a rule
//   with * would also mark the 404 page served for a missing one immutable.
//   Loaders (_expo/loaders) are JSON. Everything else (pages, loaders,
//   content/, the sitemap) keeps Workers' default, public, max-age=0,
//   must-revalidate, so a new deploy shows at once. Since a hashed file is
//   cached under its name for a year, nothing here may change one: it fails if
//   a step did, as new bytes under an old name would never reach a browser
//   that has the old ones.
//
// With --remote-audio, for release builds, it also checks that the export
// holds no audio and that the pages' og:audio points at audio.shawared.com.
//
//   bun scripts/web-release.ts [--remote-audio]
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
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

// Moves each folder's home page, x/index.html, to x.html, so Workers serves it
// at /x rather than redirecting there to /x/. Group copies such as
// (tabs)/index.html aren't addresses and stay. Returns the pages it moved.
export function pagesWithoutSlash(dist: string): string[] {
  const moved: string[] = [];
  for (const file of [...files(dist)]) {
    const parts = relative(dist, file).split(sep);
    if (parts.length < 2 || parts.at(-1) !== "index.html" || parts.some((p) => /^[([]/.test(p))) continue;
    const target = join(dist, ...parts.slice(0, -2), `${parts.at(-2)}.html`);
    if (existsSync(target)) continue;
    renameSync(file, target);
    moved.push(relative(dist, target));
  }
  return moved.sort();
}

/** Files whose names name assets: the pages, the scripts, and style sheets. */
const NAMES_ASSETS = /\.(html|js|css)$/;
const ASSET_URL = /\/assets\/[^"'()\s\\]+/g;
/** Characters an address would have to percent-encode. */
const ENCODED = /[^A-Za-z0-9._~/-]/;

/**
 * Each "page or script: address" where a page, script or style sheet names a file under
 * assets/ by an address with characters Cloudflare would answer with a redirect to their
 * percent-encoded form. The web export names none (apps/app/plugins/plain-asset-paths.js).
 */
export function encodedAssetAddresses(dist: string): string[] {
  const found = new Set<string>();
  for (const file of files(dist)) {
    if (!NAMES_ASSETS.test(file)) continue;
    for (const [url] of readFileSync(file, "utf8").matchAll(ASSET_URL)) {
      if (ENCODED.test(url) && existsSync(join(dist, url))) found.add(`${relative(dist, file)}: ${url}`);
    }
  }
  return [...found].sort();
}

/** Each hashed file's SHA-256, by its path in the export. */
export function hashedContents(dist: string): Map<string, string> {
  const digests = new Map<string, string>();
  for (const dir of HASHED_DIRS) {
    if (!existsSync(join(dist, dir))) continue;
    for (const file of files(join(dist, dir))) {
      digests.set(relative(dist, file), createHash("sha256").update(readFileSync(file)).digest("hex"));
    }
  }
  return digests;
}

/** The hashed files that changed or went since `before` (hashedContents) was taken. */
export function changedHashedFiles(dist: string, before: Map<string, string>): string[] {
  const now = hashedContents(dist);
  return [...before]
    .filter(([path, digest]) => now.get(path) !== digest)
    .map(([path]) => path)
    .sort();
}

const FONT_FACES = /<style id="expo-generated-fonts">[\s\S]*?<\/style>/;
const FONT_PRELOAD = /<link rel="preload" href="([^"]+)" as="font"[^>]*\/>/g;
const STYLESHEET = /<style id="react-native-stylesheet">([\s\S]*?)<\/style>/;

/**
 * A page without the preloads of the fonts it doesn't draw with. A page draws with a family
 * when its markup names it in a style attribute, or names a class that sets it. React Native
 * Web's style sheet holds every style the app made, used on the page or not.
 */
export function trimFontPreloads(html: string): string {
  const faces = FONT_FACES.exec(html)?.[0] ?? "";
  const familyOf = new Map([...faces.matchAll(/font-family:"([^"]+)";src:url\("([^"]+)"\)/g)].map((m) => [m[2]!, m[1]!]));
  const sheet = STYLESHEET.exec(html)?.[1] ?? "";
  const markup = html.replace(FONT_FACES, "").replace(FONT_PRELOAD, "").replace(STYLESHEET, "");
  const classes = new Set([...markup.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1]!.split(" ")));
  const drawn = (family: string) =>
    new RegExp(`${family}(?![\\w])`).test(markup) ||
    [...sheet.matchAll(/\.([\w-]+)\{[^}]*font-family:([^;}]+)/g)].some((m) => m[2] === family && classes.has(m[1]!));
  return html.replace(FONT_PRELOAD, (link, href: string) => {
    const family = familyOf.get(href);
    return family === undefined || drawn(family) ? link : "";
  });
}

/** Trims every page's font preloads; returns how many preloads it removed. */
export function trimPagesFontPreloads(dist: string): number {
  let removed = 0;
  for (const file of files(dist)) {
    if (!file.endsWith(".html")) continue;
    const html = readFileSync(file, "utf8");
    const next = trimFontPreloads(html);
    if (next === html) continue;
    removed += (html.match(FONT_PRELOAD)?.length ?? 0) - (next.match(FONT_PRELOAD)?.length ?? 0);
    writeFileSync(file, next);
  }
  return removed;
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
  const encoded = encodedAssetAddresses(dist);
  if (encoded.length) {
    throw new Error(
      `the export names assets by addresses Cloudflare redirects; export with SHAWARED_WEB_EXPORT=1 (apps/app/metro.config.js):\n${encoded.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
  const before = hashedContents(dist);
  const trimmed = trimPagesFontPreloads(dist);
  copyFileSync(join(dist, "+not-found.html"), join(dist, "404.html"));
  const moved = pagesWithoutSlash(dist);
  const { text, hashed } = headersFor(dist);
  writeFileSync(join(dist, "_headers"), text);
  const changed = changedHashedFiles(dist, before);
  if (changed.length) throw new Error(`finishing the export changed files cached as immutable under their names: ${changed.join(", ")}`);
  console.log(
    `web: plain asset addresses, ${trimmed} font preloads of faces pages don't draw with dropped, 404.html, ${moved.join(", ") || "no pages moved"}, and immutable caching for ${hashed} hashed files`,
  );
  if (process.argv.includes("--remote-audio")) {
    const problems = remoteAudioProblems(dist);
    if (problems.length) {
      console.error(`the release build isn't ready:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
      process.exit(1);
    }
    console.log(`web: no audio in the export; pages link audio on ${AUDIO_HOST}`);
  }
}
