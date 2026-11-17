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
  for (const name of [
    webJs.find((f) => f.startsWith("[id]"))!,
    webJs.find((f) => f.startsWith("+"))!,
    webJs.find((f) => f.startsWith("_layout"))!,
  ]) {
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

test("an unknown address is a 404 with the not-found page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  expect(response?.headers()["cache-control"]).toBe(REVALIDATE);
  await expect(page).toHaveTitle(/لم نجد هذه الصفحة/);
});
