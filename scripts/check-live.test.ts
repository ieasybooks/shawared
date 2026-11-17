import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { checkLive, liveProblems, LiveError, scripts, sitemapPaths, waitForBuild } from "./check-live.ts";

const SITE = "https://shawared.com";
const REVALIDATE = "public, max-age=0, must-revalidate";
const IMMUTABLE = "public, max-age=31536000, immutable";
const SCRIPT = "/_expo/static/js/web/entry-0123456789abcdef0123456789abcdef.js";
const OLD_SCRIPT = "/_expo/static/js/web/entry-fedcba9876543210fedcba9876543210.js";
const AUDIO = "https://audio.shawared.com/p/r.0123456789ab.m4a";

const scratch = mkdtempSync(join(tmpdir(), "shawared-check-live-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const page = (lang: string, extra = "") =>
  `<!DOCTYPE html><html lang="${lang}"><head><link rel="preload" href="${SCRIPT}" as="script"/>${extra}</head><body><script src="${SCRIPT}" defer></script></body></html>`;
const FILES: Record<string, string> = {
  "index.html": page("ar"),
  "en.html": page("en"),
  "poems/p.html": page("ar", `<meta property="og:audio" content="${AUDIO}"/>`),
  "en/poems/p.html": page("en", `<meta property="og:audio" content="${AUDIO}"/>`),
  "sitemap.xml": ["/", "/en", "/poems/p", "/en/poems/p"].map((p) => `<url><loc>${SITE}${p}</loc></url>`).join("\n"),
  "content/v1/catalog.json": '{"schema":1,"poems":[{"id":"p"}]}',
  "_expo/loaders/poems/p": '{"bundle":{"poem":{"id":"p"}}}',
  [SCRIPT.slice(1)]: "",
};

function dist(files: Record<string, string> = FILES): string {
  const dir = mkdtempSync(join(scratch, "dist-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return dir;
}

type Answer = { status: number; body?: string; headers?: Record<string, string> };

// shawared.com and audio.shawared.com as Cloudflare serves them, from FILES,
// with any answers replaced. Records what it was asked.
function stand(replace: Record<string, Answer | Error> = {}) {
  const asked: { url: string; init?: RequestInit }[] = [];
  const answer = (url: string): Answer | Error => {
    if (url === AUDIO) {
      return {
        status: 206,
        body: "x",
        headers: {
          "content-range": "bytes 0-0/1234",
          "access-control-allow-origin": SITE,
          "content-type": "audio/mp4",
          "cache-control": IMMUTABLE,
        },
      };
    }
    const path = new URL(url).pathname;
    const html = (file: string) => ({
      status: 200,
      body: FILES[file]!,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": REVALIDATE },
    });
    if (path === "/") return html("index.html");
    if (path === "/en" || path.startsWith("/poems/") || path.startsWith("/en/")) return html(`${path.slice(1)}.html`);
    if (path === SCRIPT)
      return { status: 200, body: "", headers: { "content-type": "application/javascript", "cache-control": IMMUTABLE } };
    if (path === "/sitemap.xml")
      return { status: 200, body: FILES["sitemap.xml"], headers: { "content-type": "application/xml", "cache-control": REVALIDATE } };
    if (path.startsWith("/content/") || path.startsWith("/_expo/loaders/")) {
      const type = path.startsWith("/content/") ? "application/json" : "application/json; charset=utf-8";
      return { status: 200, body: FILES[path.slice(1)], headers: { "content-type": type, "cache-control": REVALIDATE } };
    }
    return { status: 404, body: '<html lang="ar">', headers: { "content-type": "text/html; charset=utf-8", "cache-control": REVALIDATE } };
  };
  const fetchFn = (async (url: string, init?: RequestInit) => {
    asked.push({ url, init });
    const path = url.startsWith(SITE) ? url.slice(SITE.length) : url;
    const a = replace[path] ?? replace[url] ?? answer(url);
    if (a instanceof Error) throw a;
    return new Response(a.status === 204 || a.status === 307 ? null : (a.body ?? ""), { status: a.status, headers: a.headers });
  }) as unknown as typeof fetch;
  return { fetchFn, asked };
}

describe("scripts and sitemapPaths", () => {
  it("read the build's scripts once each, and the sitemap's paths", () => {
    expect(scripts(page("ar"))).toEqual([SCRIPT]);
    expect(scripts('<script src="https://cdn.example/x.js"></script>')).toEqual([]);
    expect(sitemapPaths(FILES["sitemap.xml"]!)).toEqual(["/", "/en", "/poems/p", "/en/poems/p"]);
  });
});

describe("waitForBuild", () => {
  it("passes as soon as the home page loads this build's scripts, asking past any cache", async () => {
    const { fetchFn, asked } = stand();
    const slept: number[] = [];
    await waitForBuild(SITE, dist(), fetchFn, async (ms) => void slept.push(ms));
    expect(slept).toEqual([]);
    expect(asked[0]!.url).toMatch(/^https:\/\/shawared\.com\/\?release-check=\d+$/);
    expect(asked[0]!.init?.redirect).toBe("manual");
  });

  it("asks again every 10 seconds while another build is served, and gives up after the last try", async () => {
    const old = { status: 200, body: page("ar").replaceAll(SCRIPT, OLD_SCRIPT), headers: { "content-type": "text/html" } };
    let served = 0;
    const flaky = (async () => {
      served++;
      if (served === 2) throw new Error("fetch failed");
      return new Response(served < 4 ? old.body : page("ar"), { status: 200 });
    }) as unknown as typeof fetch;
    const slept: number[] = [];
    await waitForBuild(SITE, dist(), flaky, async (ms) => void slept.push(ms));
    expect(slept).toEqual([10_000, 10_000, 10_000]);

    const stale = (async () => new Response(old.body, { status: 200 })) as unknown as typeof fetch;
    const error = await waitForBuild(SITE, dist(), stale, async () => {}, 3).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(LiveError);
    expect((error as Error).message).toContain(
      `still serves another build after 3 tries. Expected:\n  ${SCRIPT}\nServed:\n  ${OLD_SCRIPT}`,
    );

    const down = (async () => new Response("", { status: 522 })) as unknown as typeof fetch;
    expect(((await waitForBuild(SITE, dist(), down, async () => {}, 1).catch((e: unknown) => e)) as Error).message).toContain(
      "Served:\n  HTTP 522",
    );
  });

  it("refuses an export without the build's scripts", async () => {
    const d = dist({ ...FILES, "index.html": "<html></html>" });
    await expect(waitForBuild(SITE, d, stand().fetchFn)).rejects.toThrow("loads no scripts from /_expo/static; build the release first");
  });
});

describe("liveProblems", () => {
  it("passes a site serving the build, and asks for the recording as the player does", async () => {
    const { fetchFn, asked } = stand();
    expect(await liveProblems(SITE, dist(), fetchFn)).toEqual({ problems: [], pages: 4 });
    const urls = asked.map((a) => a.url);
    for (const path of [
      "/sitemap.xml",
      "/content/v1/catalog.json",
      "/",
      "/en",
      "/poems/p",
      "/en/poems/p",
      "/_expo/loaders/poems/p",
      SCRIPT,
    ]) {
      expect(urls).toContain(`${SITE}${path}`);
    }
    expect(urls.some((u) => /\/no-such-page-\d+$/.test(u))).toBe(true);
    expect(asked.find((a) => a.url === AUDIO)?.init?.headers).toEqual({ Range: "bytes=0-0", Origin: SITE });
    expect(asked.filter((a) => a.url !== AUDIO).every((a) => a.init?.redirect === "manual")).toBe(true);
  });

  it("reports redirects, the wrong language, stale content and the wrong caching", async () => {
    const html = { "content-type": "text/html; charset=utf-8", "cache-control": REVALIDATE };
    const { fetchFn } = stand({
      "/en": { status: 307, headers: { location: "/en/" } },
      "/en/poems/p": { status: 200, body: page("ar"), headers: html },
      "/poems/p": { status: 200, body: FILES["poems/p.html"], headers: { ...html, "cache-control": "public, max-age=14400" } },
      "/content/v1/catalog.json": {
        status: 200,
        body: '{"schema":1,"poems":[]}',
        headers: { "content-type": "application/json", "cache-control": REVALIDATE },
      },
      [SCRIPT]: { status: 200, body: "", headers: { "content-type": "application/javascript", "cache-control": REVALIDATE } },
      "/sitemap.xml": { status: 200, body: FILES["sitemap.xml"], headers: { "content-type": "text/plain", "cache-control": REVALIDATE } },
    });
    // Pages are asked for together, so in no fixed order.
    expect((await liveProblems(SITE, dist(), fetchFn)).problems.sort()).toEqual(
      [
        "/sitemap.xml: Content-Type text/plain",
        "/content/v1/catalog.json: not this build's",
        "/poems/p: Cache-Control public, max-age=14400",
        "/en: HTTP 307 to /en/, not 200",
        "/en/poems/p: not the English page",
        `${SCRIPT}: Cache-Control ${REVALIDATE}`,
      ].sort(),
    );
  });

  it("reports a soft 404, a loader with another poem's data, and a network failure", async () => {
    const { fetchFn } = stand({
      "/_expo/loaders/poems/p": {
        status: 200,
        body: '{"bundle":{"poem":{"id":"q"}}}',
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": REVALIDATE },
      },
      "/": new Error("fetch failed"),
    });
    const soft = (async (url: string, init?: RequestInit) =>
      /no-such-page/.test(url)
        ? new Response(page("ar"), { status: 200, headers: { "content-type": "text/html", "cache-control": REVALIDATE } })
        : fetchFn(url, init)) as unknown as typeof fetch;
    const { problems } = await liveProblems(SITE, dist(), soft);
    expect(problems).toContain("/: fetch failed");
    expect(problems).toContain("/_expo/loaders/poems/p: not p's data");
    expect(problems.find((p) => p.startsWith("/no-such-page-"))).toMatch(/: HTTP 200, not 404$/);
  });

  it("reports a poem page without its recording, and a recording that doesn't play", async () => {
    const html = { "content-type": "text/html; charset=utf-8", "cache-control": REVALIDATE };
    const silent = stand({ "/poems/p": { status: 200, body: page("ar"), headers: html } }).fetchFn;
    expect((await liveProblems(SITE, dist(), silent)).problems).toEqual(["/poems/p links no recording (og:audio)"]);
    const { fetchFn } = stand({ [AUDIO]: { status: 404, body: "" } });
    expect((await liveProblems(SITE, dist(), fetchFn)).problems).toEqual([`${AUDIO}, the recording /poems/p links: HTTP 404, not 206`]);
  });

  it("reports a catalog whose first poem the sitemap doesn't list", async () => {
    const sitemap = FILES["sitemap.xml"]!.split("\n")
      .filter((l) => !l.includes("/poems/p<"))
      .join("\n");
    const served = stand({
      "/sitemap.xml": { status: 200, body: sitemap, headers: { "content-type": "application/xml", "cache-control": REVALIDATE } },
    });
    expect((await liveProblems(SITE, dist({ ...FILES, "sitemap.xml": sitemap }), served.fetchFn)).problems).toEqual([
      "the sitemap doesn't list /poems/p",
    ]);
  });
});

describe("checkLive", () => {
  const redirect = { status: 307, headers: { location: "/en/" } };

  it("asks again while a location still serves the last deploy, whose scripts were the same", async () => {
    const live = stand();
    let stale = 2;
    const fetchFn = (async (url: string, init?: RequestInit) =>
      url === `${SITE}/en` && stale-- > 0 ? new Response(null, redirect) : live.fetchFn(url, init)) as unknown as typeof fetch;
    const slept: number[] = [];
    expect(await checkLive(SITE, dist(), fetchFn, async (ms) => void slept.push(ms))).toBe(4);
    expect(slept).toEqual([10_000, 10_000]);
  });

  it("gives up after the last try with what's still wrong", async () => {
    const { fetchFn } = stand({ "/en": redirect });
    const slept: number[] = [];
    const error = await checkLive(SITE, dist(), fetchFn, async (ms) => void slept.push(ms), 3).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(LiveError);
    expect((error as Error).message).toBe(`${SITE} serves this build's scripts, but after 3 tries:\n  - /en: HTTP 307 to /en/, not 200`);
    expect(slept).toEqual([10_000, 10_000]);
  });
});
