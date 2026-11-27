import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, expect, it } from "vitest";

const scratch = mkdtempSync(join(tmpdir(), "shawared-sitemap-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

it("pairs public Arabic and English pages while excluding private pages and route artifacts", () => {
  const dist = join(scratch, "apps/app/dist");
  for (const file of [
    "index.html",
    "en/index.html",
    "poems/p.html",
    "en/poems/p.html",
    "en/poems/english-only.html",
    "library.html",
    "en/library.html",
    "playlist.html",
    "en/playlist.html",
    "app.html",
    "en/app.html",
    "+not-found.html",
    "(tabs)/index.html",
    "poems/[id].html",
    "_expo/loader.html",
  ]) {
    const path = join(dist, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "<html></html>");
  }

  const result = spawnSync("bun", [join(import.meta.dirname, "sitemap.ts")], {
    encoding: "utf8",
    env: { ...process.env, SHAWARED_ROOT: scratch },
  });
  expect(result.status, result.stderr).toBe(0);
  const xml = readFileSync(join(dist, "sitemap.xml"), "utf8");
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, entry]) => ({
    path: /<loc>https:\/\/shawared.com([^<]+)<\/loc>/.exec(entry!)![1],
    alternates: [...entry!.matchAll(/hreflang="([^"]+)" href="https:\/\/shawared.com([^"]+)"/g)].map(([, lang, path]) => [lang, path]),
  }));
  const home = [
    ["ar", "/"],
    ["en", "/en"],
    ["x-default", "/"],
  ];
  const poem = [
    ["ar", "/poems/p"],
    ["en", "/en/poems/p"],
    ["x-default", "/poems/p"],
  ];
  expect(entries).toEqual([
    { path: "/", alternates: home },
    { path: "/en", alternates: home },
    { path: "/en/poems/english-only", alternates: [["en", "/en/poems/english-only"]] },
    { path: "/poems/p", alternates: poem },
    { path: "/en/poems/p", alternates: poem },
  ]);
});
