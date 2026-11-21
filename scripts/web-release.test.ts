import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  changedHashedFiles,
  encodedAssetAddresses,
  hashedContents,
  headersFor,
  MAX_RULES,
  pagesWithoutSlash,
  remoteAudioProblems,
  trimFontPreloads,
} from "./web-release.ts";

const scratch = mkdtempSync(join(tmpdir(), "shawared-web-release-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const H = "0123456789abcdef0123456789abcdef";
function dist(files: Record<string, string>): string {
  const dir = mkdtempSync(join(scratch, "dist-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return dir;
}

describe("headersFor", () => {
  it("caches each hashed file as immutable by its own rule, with its URL's encoding, and serves loaders and Apple's app links as JSON", () => {
    const d = dist({
      [`_expo/static/js/web/[id]-${H}.js`]: "",
      [`_expo/static/js/web/+not-found-${H}.js`]: "",
      [`assets/x/close-icon.${H}@4x.png`]: "",
      "index.html": "",
      "_expo/loaders/poems/x": "{}",
    });
    expect(headersFor(d)).toEqual({
      hashed: 3,
      text:
        [
          "/_expo/loaders/*\n  Content-Type: application/json; charset=utf-8",
          "/.well-known/apple-app-site-association\n  Content-Type: application/json",
          `/_expo/static/js/web/%2Bnot-found-${H}.js\n  Cache-Control: public, max-age=31536000, immutable`,
          `/_expo/static/js/web/%5Bid%5D-${H}.js\n  Cache-Control: public, max-age=31536000, immutable`,
          `/assets/x/close-icon.${H}%404x.png\n  Cache-Control: public, max-age=31536000, immutable`,
        ].join("\n\n") + "\n",
    });
  });

  it("refuses a file without a hash where hashed files go", () => {
    expect(() => headersFor(dist({ "assets/logo.png": "" }))).toThrow(
      "files without a content hash in their names, which can't be cached as immutable: assets/logo.png",
    );
  });

  it("refuses more rules than Cloudflare reads", () => {
    const files = Object.fromEntries(Array.from({ length: MAX_RULES - 1 }, (_, i) => [`assets/a${i}.${H}.png`, ""]));
    expect(() => headersFor(dist(files))).toThrow(`${MAX_RULES + 1} header rules, over Cloudflare's ${MAX_RULES}`);
  });
});

describe("pagesWithoutSlash", () => {
  it("moves each folder's home page beside its folder, and leaves the root, group copies and taken names alone", () => {
    const d = dist({
      "index.html": "ar home",
      "en/index.html": "en home",
      "en/(tabs)/index.html": "group copy",
      "(tabs)/index.html": "group copy",
      "en/poems/x.html": "poem",
      "meters.html": "meters",
      "meters/index.html": "shadowed",
      "[id]/index.html": "fallback",
    });
    expect(pagesWithoutSlash(d)).toEqual(["en.html"]);
    expect(readFileSync(join(d, "en.html"), "utf8")).toBe("en home");
    expect(existsSync(join(d, "en/index.html"))).toBe(false);
    for (const kept of [
      "index.html",
      "en/(tabs)/index.html",
      "(tabs)/index.html",
      "en/poems/x.html",
      "meters/index.html",
      "[id]/index.html",
    ])
      expect(existsSync(join(d, kept)), kept).toBe(true);
    expect(pagesWithoutSlash(d)).toEqual([]);
  });
});

describe("remoteAudioProblems", () => {
  it("passes an export without audio whose pages link audio.shawared.com", () => {
    expect(
      remoteAudioProblems(dist({ "poems/x.html": '<meta property="og:audio" content="https://audio.shawared.com/x/y.0123456789ab.m4a">' })),
    ).toEqual([]);
  });

  it("reports audio in the export, and pages linking audio on shawared.com", () => {
    expect(
      remoteAudioProblems(
        dist({
          "audio/x/y.m4a": "",
          "assets/z.mp3": "",
          "poems/x.html": '<meta property="og:audio" content="https://shawared.com/audio/x/y.m4a">',
        }),
      ).sort(),
    ).toEqual(
      [
        "assets/z.mp3 is audio, which comes from https://audio.shawared.com",
        "audio/x/y.m4a is audio, which comes from https://audio.shawared.com",
        "poems/x.html links audio on https://shawared.com/audio/ instead of https://audio.shawared.com",
      ].sort(),
    );
  });
});

describe("encodedAssetAddresses", () => {
  const FONT = `/assets/__node_modules/.bun/@expo-google-fonts+amiri@0.4.1/node_modules/@expo-google-fonts/amiri/400Regular/Amiri_400Regular.${H}.ttf`;
  const PLAIN = `/assets/__node_modules/.bun/_expo-google-fonts_amiri_0.4.1/node_modules/_expo-google-fonts/amiri/400Regular/Amiri_400Regular.${H}.ttf`;

  it("passes an export whose pages, scripts and style sheets name assets by plain addresses", () => {
    const d = dist({
      [PLAIN.slice(1)]: "font",
      // A multi-resolution image's other scales: Expo exports them, and the web names only the first.
      [`assets/x/close-icon.${H}@2x.png`]: "png",
      "poems/x.html": `<link rel="preload" href="${PLAIN}" as="font"/><style>@font-face{src:url("${PLAIN}")}</style>`,
      [`_expo/static/js/web/entry-${H}.js`]: `var a={uri:"${PLAIN}"},b="/assets/?unstable_path=./x@y";`,
      [`_expo/static/css/web-${H}.css`]: `@font-face{src:url(${PLAIN})}`,
    });
    expect(encodedAssetAddresses(d)).toEqual([]);
  });

  it("reports each page, script and style sheet naming an asset by an address Cloudflare would redirect", () => {
    const d = dist({
      [FONT.slice(1)]: "font",
      "poems/x.html": `<link rel="preload" href="${FONT}" as="font"/><style>@font-face{src:url("${FONT}")}</style>`,
      [`_expo/static/js/web/entry-${H}.js`]: `var a={uri:"${FONT}"};`,
      [`_expo/static/css/web-${H}.css`]: `@font-face{src:url(${FONT})}`,
      // Published content isn't a page or a script.
      "content/v1/catalog.json": `{"note":"${FONT}"}`,
    });
    expect(encodedAssetAddresses(d)).toEqual(
      [`_expo/static/css/web-${H}.css: ${FONT}`, `_expo/static/js/web/entry-${H}.js: ${FONT}`, `poems/x.html: ${FONT}`].sort(),
    );
  });
});

describe("changedHashedFiles", () => {
  it("reports a hashed file whose bytes changed or that went, and nothing for pages", () => {
    const d = dist({
      [`_expo/static/js/web/entry-${H}.js`]: "entry",
      [`_expo/static/js/web/pages-${H}.js`]: "pages",
      [`assets/x/logo.${H}.png`]: "png",
      "index.html": "home",
    });
    const before = hashedContents(d);
    expect([...before.keys()].sort()).toEqual([
      `_expo/static/js/web/entry-${H}.js`,
      `_expo/static/js/web/pages-${H}.js`,
      `assets/x/logo.${H}.png`,
    ]);
    writeFileSync(join(d, "index.html"), "home, with fewer preloads");
    writeFileSync(join(d, `_expo/static/js/web/pages-${H}.js`), "pages");
    expect(changedHashedFiles(d, before)).toEqual([]);
    writeFileSync(join(d, `_expo/static/js/web/entry-${H}.js`), "entry, rewritten");
    rmSync(join(d, `assets/x/logo.${H}.png`));
    expect(changedHashedFiles(d, before)).toEqual([`_expo/static/js/web/entry-${H}.js`, `assets/x/logo.${H}.png`]);
  });
});

describe("trimFontPreloads", () => {
  const preload = (f: string) => `<link rel="preload" href="/assets/${f}.ttf" as="font" crossorigin=""/>`;
  const page = (body: string) =>
    `<head>${preload("Amiri")}${preload("Kufi")}${preload("News")}<style id="react-native-stylesheet">.r-a{font-family:Kufi_600SemiBold;}.r-b{font-family:News_400Regular;}</style></head>` +
    `<body>${body}<style id="expo-generated-fonts">@font-face{font-family:"Amiri_400Regular";src:url("/assets/Amiri.ttf")}
@font-face{font-family:"Kufi_600SemiBold";src:url("/assets/Kufi.ttf")}
@font-face{font-family:"News_400Regular";src:url("/assets/News.ttf")}</style></body>`;

  it("keeps the preloads of the faces the markup draws with, inline or through a class it uses", () => {
    const html = trimFontPreloads(page(`<div style="font-family:Amiri_400Regular">بيت</div><div class="css-x r-a">شوارد</div>`));
    expect(html).toContain(preload("Amiri"));
    expect(html).toContain(preload("Kufi"));
    expect(html).not.toContain(preload("News"));
    expect(html).toContain('font-family:"News_400Regular"');
  });
});
