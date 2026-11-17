import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { headersFor, MAX_RULES, remoteAudioProblems } from "./web-release.ts";

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
  it("caches each hashed file as immutable by its own rule, with its URL's encoding, and serves loaders as JSON", () => {
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
    const files = Object.fromEntries(Array.from({ length: MAX_RULES }, (_, i) => [`assets/a${i}.${H}.png`, ""]));
    expect(() => headersFor(dist(files))).toThrow(`${MAX_RULES + 1} header rules, over Cloudflare's ${MAX_RULES}`);
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
