// Checks that shawared.com serves the build in apps/app/dist, as readers and
// search engines reach it. The web workflow runs it after each deploy, and for
// a commit that's already live; run it after deploying by hand too.
//
//   bun scripts/check-live.ts [https://shawared.com]
//
// - The home page loads this build's scripts. A deploy takes a few seconds to
//   reach every location, so it asks again for up to two minutes.
// - The sitemap and the published catalog are this build's, byte for byte.
// - Every address in the sitemap answers with its page, without a redirect, in
//   its language, revalidated on each visit.
// - A poem's loader is JSON, a hashed script is cached as immutable, and an
//   unknown address is a 404.
// - The recording that poem's page links plays from audio.shawared.com as the
//   player asks for it (scripts/verify-audio.ts).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { IMMUTABLE, root, SITE } from "./recordings.ts";
import { servingProblem } from "./verify-audio.ts";

const REVALIDATE = "public, max-age=0, must-revalidate";
const LOADER_TYPE = "application/json; charset=utf-8";

export class LiveError extends Error {}

type Fetch = typeof fetch;

// The build's scripts, as a page loads them.
export function scripts(html: string): string[] {
  return [...new Set([...html.matchAll(/(?:src|href)="(\/_expo\/static\/[^"]+)"/g)].map((m) => m[1]!))].sort();
}

// The sitemap's addresses, as paths.
export function sitemapPaths(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
}

const get = (fetchFn: Fetch, url: string) => fetchFn(url, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

// Waits until the home page loads the build's scripts.
export async function waitForBuild(site: string, dist: string, fetchFn: Fetch = fetch, sleep = wait, attempts = 12): Promise<void> {
  const expected = scripts(readFileSync(join(dist, "index.html"), "utf8"));
  if (!expected.length) throw new LiveError(`${join(dist, "index.html")} loads no scripts from /_expo/static; build the release first`);
  let served = "";
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await get(fetchFn, `${site}/?release-check=${Date.now()}`);
      const found = response.ok ? scripts(await response.text()) : [];
      if (found.join() === expected.join()) return;
      served = response.ok ? found.join("\n  ") || "a page without scripts" : `HTTP ${response.status}`;
    } catch (error) {
      served = (error as Error).message;
    }
    if (attempt === attempts) {
      throw new LiveError(
        `${site}/ still serves another build after ${attempts} tries. Expected:\n  ${expected.join("\n  ")}\nServed:\n  ${served}`,
      );
    }
    await sleep(10_000);
  }
}

type Want = { status: number; type: string; cache: string; lang?: "ar" | "en"; body?: string };

// What's wrong with how the site serves the build, once it serves its scripts.
export async function liveProblems(site: string, dist: string, fetchFn: Fetch = fetch): Promise<{ problems: string[]; pages: number }> {
  const problems: string[] = [];
  const read = (path: string) => readFileSync(join(dist, path), "utf8");

  // Asks for path and checks the answer; returns its body when it's right.
  async function check(path: string, want: Want): Promise<string | null> {
    let response: Response;
    let body: string;
    try {
      response = await get(fetchFn, site + path);
      body = await response.text();
    } catch (error) {
      problems.push(`${path}: ${(error as Error).message}`);
      return null;
    }
    const header = (name: string) => response.headers.get(name) ?? "none";
    const wrong: string[] = [];
    if (response.status !== want.status) {
      const to = response.headers.get("location");
      wrong.push(`HTTP ${response.status}${to ? ` to ${to}` : ""}, not ${want.status}`);
    } else {
      if (!header("content-type").includes(want.type)) wrong.push(`Content-Type ${header("content-type")}`);
      if (header("cache-control") !== want.cache) wrong.push(`Cache-Control ${header("cache-control")}`);
      if (want.lang && !body.includes(`<html lang="${want.lang}"`)) wrong.push(`not the ${want.lang === "ar" ? "Arabic" : "English"} page`);
      if (want.body !== undefined && body !== want.body) wrong.push("not this build's");
    }
    if (wrong.length) {
      problems.push(`${path}: ${wrong.join(", ")}`);
      return null;
    }
    return body;
  }

  const sitemap = read("sitemap.xml");
  const catalog = read("content/v1/catalog.json");
  await check("/sitemap.xml", { status: 200, type: "xml", cache: REVALIDATE, body: sitemap });
  await check("/content/v1/catalog.json", { status: 200, type: "json", cache: REVALIDATE, body: catalog });

  const paths = sitemapPaths(sitemap);
  const html: Record<string, string | null> = {};
  for (let i = 0; i < paths.length; i += 8) {
    await Promise.all(
      paths.slice(i, i + 8).map(async (path) => {
        const lang = path === "/en" || path.startsWith("/en/") ? "en" : "ar";
        html[path] = await check(path, { status: 200, type: "text/html", cache: REVALIDATE, lang });
      }),
    );
  }

  const poem = (JSON.parse(catalog) as { poems: { id: string }[] }).poems[0]?.id;
  if (!poem) problems.push("the catalog has no poems");
  else {
    const loader = await check(`/_expo/loaders/poems/${poem}`, { status: 200, type: LOADER_TYPE, cache: REVALIDATE });
    if (loader !== null && (JSON.parse(loader) as { bundle?: { poem?: { id?: string } } }).bundle?.poem?.id !== poem) {
      problems.push(`/_expo/loaders/poems/${poem}: not ${poem}'s data`);
    }
    const page = html[`/poems/${poem}`];
    const audio = page && /<meta property="og:audio" content="([^"]+)"/.exec(page)?.[1];
    if (page === undefined) problems.push(`the sitemap doesn't list /poems/${poem}`);
    else if (page !== null && !audio) problems.push(`/poems/${poem} links no recording (og:audio)`);
    else if (audio) {
      const problem = await servingProblem(audio, fetchFn);
      if (problem) problems.push(`${audio}, the recording /poems/${poem} links: ${problem}`);
    }
  }

  const script = scripts(read("index.html"))[0]!;
  await check(script, { status: 200, type: "javascript", cache: IMMUTABLE });
  await check(`/no-such-page-${Date.now()}`, { status: 404, type: "text/html", cache: REVALIDATE });
  return { problems, pages: paths.length };
}

if (import.meta.main) {
  const site = (process.argv[2] ?? SITE).replace(/\/+$/, "");
  const dist = join(root(), "apps/app/dist");
  try {
    await waitForBuild(site, dist);
    const { problems, pages } = await liveProblems(site, dist);
    if (problems.length) throw new LiveError(`${site} serves this build, but:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    console.log(`${site} serves this build: its ${pages} pages, content, a poem's loader and recording, and the 404 page.`);
  } catch (error) {
    if (!(error instanceof LiveError)) throw error;
    console.error(error.message);
    process.exit(1);
  }
}
