import { readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type APIResponse } from "@playwright/test";

// The export as Cloudflare serves it (playwright.release.config.ts): what each
// kind of file is cached as, and the 404s. scripts/web-release.ts writes the
// rules.
const IMMUTABLE = "public, max-age=31536000, immutable";
const REVALIDATE = "public, max-age=0, must-revalidate";
const DIST = join(import.meta.dirname, "../apps/app/dist");
const POEM = "/poems/taqulu-buthaynatu";

const header = (r: APIResponse, name: string) => r.headers()[name];
const webJs = readdirSync(join(DIST, "_expo/static/js/web"));

test("files whose names carry their hash are cached as immutable, whatever characters they use", async ({ request }) => {
  // Every script; a route's own (its name starting "[id]" or "+") when routes are split off.
  expect(webJs.length).toBeGreaterThan(0);
  for (const name of webJs) {
    const r = await request.get(`/_expo/static/js/web/${name}`);
    expect(r.status(), name).toBe(200);
    expect(header(r, "cache-control"), name).toBe(IMMUTABLE);
    expect(header(r, "content-type"), name).toContain("javascript");
  }
  const page = await (await request.get(POEM)).text();
  const script = /src="(\/_expo\/static\/js\/web\/[^"]+)"/.exec(page)![1]!;
  expect(header(await request.get(script), "cache-control")).toBe(IMMUTABLE);
});

test("a missing hashed file is a 404 that isn't cached", async ({ request }) => {
  const r = await request.get(`/_expo/static/js/web/gone-${"0".repeat(32)}.js`);
  expect(r.status()).toBe(404);
  expect(header(r, "cache-control")).toBe(REVALIDATE);
});

test("pages, loaders, published content and the sitemap are revalidated", async ({ request }) => {
  for (const path of ["/", "/en", POEM, `/en${POEM}`, "/content/v1/catalog.json", "/sitemap.xml"]) {
    const r = await request.get(path);
    expect(r.status(), path).toBe(200);
    expect(header(r, "cache-control"), path).toBe(REVALIDATE);
  }
  const loader = await request.get(`/_expo/loaders${POEM}`);
  expect(loader.status()).toBe(200);
  expect(header(loader, "content-type")).toBe("application/json; charset=utf-8");
  expect(header(loader, "cache-control")).toBe(REVALIDATE);
  expect((await loader.json()).bundle.poem.id).toBe("taqulu-buthaynatu");
});

test("every address in the sitemap answers with its page, without a redirect", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const paths = [...sitemap.matchAll(/<loc>https:\/\/shawared\.com([^<]*)<\/loc>/g)].map((m) => m[1]!);
  expect(paths).toEqual(
    expect.arrayContaining([
      "/",
      "/en",
      POEM,
      `/en${POEM}`,
      "/about",
      "/privacy",
      "/terms",
      "/support",
      "/en/about",
      "/en/privacy",
      "/en/terms",
      "/en/support",
    ]),
  );
  for (const path of paths) {
    const r = await request.get(path, { maxRedirects: 0 });
    expect(r.status(), path).toBe(200);
    expect(header(r, "content-type"), path).toContain("text/html");
  }
});

test("an unknown address is a 404 with the not-found page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  expect(response?.headers()["cache-control"]).toBe(REVALIDATE);
  await expect(page).toHaveTitle(/لم نجد هذه الصفحة/);
});

test("every file a page names, its fonts included, answers without a redirect", async ({ request }) => {
  for (const path of ["/", POEM, `/en${POEM}`]) {
    const html = await (await request.get(path)).text();
    const urls = [...html.matchAll(/(?:href|src)="(\/(?:assets|_expo)\/[^"]+)"|url\("(\/assets\/[^"]+)"\)/g)].map((m) => m[1] ?? m[2]!);
    expect(
      urls.some((u) => u.endsWith(".ttf")),
      path,
    ).toBe(true);
    for (const url of new Set(urls)) {
      expect(url, path).toMatch(/^[A-Za-z0-9._~/-]+$/);
      const r = await request.get(url, { maxRedirects: 0 });
      expect(r.status(), url).toBe(200);
      expect(header(r, "cache-control"), url).toBe(IMMUTABLE);
    }
  }
});
