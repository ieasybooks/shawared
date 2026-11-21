// Writes sitemap.xml for the exported web site (apps/app/dist), from the pages it holds:
// every page, in Arabic and English, each pointing at the other.
// Usage: bun scripts/sitemap.ts   (after `expo export`; `bun run web:build` runs both)
import { readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const SITE = "https://shawared.com";
const DIST = join(import.meta.dir, "..", "apps", "app", "dist");

function* htmlFiles(dir: string): Generator<string> {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(path);
    else if (e.name.endsWith(".html")) yield relative(DIST, path).split(sep).join("/");
  }
}

/** poems/x.html → /poems/x, en/index.html → /en. Null for pages that aren't addresses. */
function pathOf(file: string): string | null {
  // Group copies ("(tabs)/…"), dynamic fallbacks ("[id].html") and the not-found page.
  if (/[([]|\+not-found|^_/.test(file)) return null;
  // The reader's library and playlists, which live on their device, and the app page, which
  // sends phones on to their stores.
  if (/^(en\/)?(library|playlist|app)\.html$/.test(file)) return null;
  const bare = file.replace(/\.html$/, "").replace(/(^|\/)index$/, "");
  return `/${bare}`;
}

const pages = new Map<string, { ar?: string; en?: string }>();
for (const file of htmlFiles(DIST)) {
  const path = pathOf(file);
  if (path === null) continue;
  const en = path === "/en" || path.startsWith("/en/");
  const key = en ? path.slice(3) || "/" : path;
  pages.set(key, { ...pages.get(key), [en ? "en" : "ar"]: path });
}

const url = (path: string) => `${SITE}${path}`;
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const entries = [...pages.keys()].sort().flatMap((key) => {
  const p = pages.get(key)!;
  const alternates = (["ar", "en"] as const)
    .filter((l) => p[l])
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${escape(url(p[l]!))}"/>`);
  if (p.ar) alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(url(p.ar))}"/>`);
  return (["ar", "en"] as const)
    .filter((l) => p[l])
    .map((l) => [`  <url>`, `    <loc>${escape(url(p[l]!))}</loc>`, ...alternates, `  </url>`].join("\n"));
});

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
  ...entries,
  `</urlset>`,
  ``,
].join("\n");
writeFileSync(join(DIST, "sitemap.xml"), xml);
console.log(`sitemap.xml: ${entries.length} pages`);
