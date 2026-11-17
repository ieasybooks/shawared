// The audio round trip on a copy of content/: a recording's upload writes its
// hashed key into the recitation file, the checker accepts it and checks the
// local source against it, and a local preview build copies the source to the
// key's path, while a release build carries no audio.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { hashOf, keyFor, parseKey, recordings, sourcePath } from "./audio.ts";
import { uploadAudio, withKey, type Bucket } from "./upload-audio.ts";
import { audioProblems } from "./verify-audio.ts";

const REPO = join(import.meta.dirname, "..");
const scratch = mkdtempSync(join(tmpdir(), "shawared-audio-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

// A copy of the repository's content, with a silent recording of the real
// one's length in its source's place.
function copyOfContent(): string {
  const root = mkdtempSync(join(scratch, "root-"));
  cpSync(join(REPO, "content"), join(root, "content"), { recursive: true });
  const [r] = recordings(root);
  const source = sourcePath(root, r!.poem, r!.recitation);
  mkdirSync(join(source, ".."), { recursive: true });
  const ffmpeg = spawnSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=44100:cl=mono",
    "-t",
    String(r!.duration),
    "-c:a",
    "aac",
    "-b:a",
    "32k",
    "-y",
    source,
  ]);
  if (ffmpeg.status !== 0) throw new Error("ffmpeg couldn't make the test recording");
  return root;
}

// A bucket in memory, which records what's put.
function memoryBucket(): Bucket & { objects: Map<string, Uint8Array> } {
  const objects = new Map<string, Uint8Array>();
  return { objects, exists: async (key) => objects.has(key), put: async (key, bytes) => void objects.set(key, bytes) };
}

const run = (root: string, script: string, ...args: string[]) =>
  spawnSync("bun", [join(REPO, "scripts", script), ...args], { encoding: "utf8", env: { ...process.env, SHAWARED_ROOT: root } });

describe("keys", () => {
  it("name a recording before and after its upload", () => {
    expect(parseKey("taqulu-buthaynatu/osama-alwaaedh.m4a")).toEqual({ poem: "taqulu-buthaynatu", recitation: "osama-alwaaedh" });
    expect(parseKey("taqulu-buthaynatu/osama-alwaaedh.0123456789ab.m4a")).toEqual({
      poem: "taqulu-buthaynatu",
      recitation: "osama-alwaaedh",
      hash: "0123456789ab",
    });
    for (const bad of ["x.m4a", "a/b.0123456789AB.m4a", "a/b.0123.m4a", "a/b/c.m4a", "a/b.mp3"]) expect(parseKey(bad), bad).toBeNull();
  });

  it("carry the first 12 hex digits of the source's SHA-256", () => {
    const bytes = new TextEncoder().encode("a recording");
    // printf 'a recording' | shasum -a 256
    expect(hashOf(bytes)).toBe("973d5cd4d1c9");
    expect(keyFor("p", "r", bytes)).toBe("p/r.973d5cd4d1c9.m4a");
  });
});

describe("the round trip", () => {
  it("uploads once, writes the key, checks it, and previews it locally", async () => {
    const root = copyOfContent();
    const [r] = recordings(root);
    const source = sourcePath(root, r!.poem, r!.recitation);
    const key = keyFor(r!.poem, r!.recitation, readFileSync(source));
    const before = readFileSync(r!.file, "utf8");

    // The checker warns that the recording isn't uploaded yet.
    const unuploaded = run(root, "check.ts");
    expect(unuploaded.status, unuploaded.stdout + unuploaded.stderr).toBe(0);
    expect(unuploaded.stdout).toContain("audio isn't uploaded yet");

    const bucket = memoryBucket();
    const first = await uploadAudio(root, bucket, () => {});
    expect(first).toEqual({ uploaded: [key], present: [], updated: [r!.file.slice(root.length + 1)], noSource: [] });
    expect(Buffer.from(bucket.objects.get(key)!).equals(readFileSync(source))).toBe(true);
    // Only the audio line changed, so the file keeps its formatting.
    const after = readFileSync(r!.file, "utf8");
    expect(after).toBe(before.replace(`"audio": "${r!.audio}"`, `"audio": "${key}"`));

    // Again: nothing to upload or change.
    expect(await uploadAudio(root, bucket, () => {})).toEqual({ uploaded: [], present: [key], updated: [], noSource: [] });

    // The checker takes the key, and checks the source's duration and hash against it.
    const uploaded = run(root, "check.ts");
    expect(uploaded.status, uploaded.stdout + uploaded.stderr).toBe(0);
    expect(uploaded.stdout).not.toContain("audio isn't uploaded yet");
    expect(uploaded.stdout).not.toContain("duration not verified");

    // A local preview build plays the source from the key's path.
    const out = join(root, "public");
    const preview = run(root, "build-content.ts", "--out", join(out, "content"), "--audio-out", join(out, "audio"));
    expect(preview.status, preview.stderr).toBe(0);
    expect(readFileSync(join(out, "audio", key))).toEqual(readFileSync(source));
    const bundle = JSON.parse(readFileSync(join(out, "content/v1/poems", r!.poem, "ar.json"), "utf8"));
    expect(bundle.recitations[0].audio).toBe(key);

    // A release build clears that audio and copies none.
    const release = run(root, "build-content.ts", "--out", join(out, "content"), "--audio-out", join(out, "audio"), "--remote-audio");
    expect(release.status, release.stderr).toBe(0);
    expect(existsSync(join(out, "audio"))).toBe(false);
  }, 60_000);

  it("refuses a source that isn't the uploaded recording", async () => {
    const root = copyOfContent();
    await uploadAudio(root, memoryBucket(), () => {});
    const [r] = recordings(root);
    writeFileSync(sourcePath(root, r!.poem, r!.recitation), new Uint8Array([1, 2, 3]));
    const result = run(root, "check.ts");
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("isn't the uploaded recording");
  }, 60_000);

  it("leaves recordings without a source alone", async () => {
    const root = mkdtempSync(join(scratch, "root-"));
    cpSync(join(REPO, "content"), join(root, "content"), { recursive: true });
    const [r] = recordings(root);
    const result = await uploadAudio(root, memoryBucket(), () => {});
    expect(result).toEqual({ uploaded: [], present: [], updated: [], noSource: [`media/audio/${r!.poem}/${r!.recitation}.m4a`] });
    expect(readFileSync(r!.file, "utf8")).toContain(`"audio": "${r!.audio}"`);
  });

  it("changes only the audio line, and only when it's there once", () => {
    const r = { poem: "p", recitation: "r", file: "f.json", audio: "p/r.m4a", duration: 1 };
    expect(withKey('{\n  "audio": "p/r.m4a",\n  "x": 1\n}', r, "p/r.0123456789ab.m4a")).toBe(
      '{\n  "audio": "p/r.0123456789ab.m4a",\n  "x": 1\n}',
    );
    expect(() => withKey('{"audio": "other.m4a"}', r, "k")).toThrow("expected one");
  });
});

describe("audioProblems", () => {
  const recording = (audio: string) => ({
    poem: "p",
    recitation: "r",
    file: join(scratch, "content/poems/p/recitations/r.json"),
    audio,
    duration: 1,
  });
  const answer = (status: number, headers: Record<string, string>) => async () =>
    new Response(status === 206 ? "x" : null, { status, headers });
  const good = {
    "content-range": "bytes 0-0/1234",
    "access-control-allow-origin": "https://shawared.com",
    "content-type": "audio/mp4",
    "cache-control": "public, max-age=31536000, immutable",
  };

  it("passes a recording served as the player asks for it", async () => {
    let asked: RequestInit | undefined;
    const fetchFn = (async (url: string, init?: RequestInit) => {
      asked = init;
      expect(url).toBe("https://audio.shawared.com/p/r.0123456789ab.m4a");
      return answer(206, good)();
    }) as unknown as typeof fetch;
    expect(await audioProblems(scratch, [recording("p/r.0123456789ab.m4a")], fetchFn)).toEqual([]);
    expect(asked?.headers).toEqual({ Range: "bytes=0-0", Origin: "https://shawared.com" });
  });

  it("reports a recording that isn't uploaded, without asking for it", async () => {
    const fetchFn = (async () => {
      throw new Error("asked");
    }) as unknown as typeof fetch;
    const [problem] = await audioProblems(scratch, [recording("p/r.m4a")], fetchFn);
    expect(problem).toContain("p/r.m4a isn't uploaded yet");
  });

  it("reports a missing recording, and wrong headers", async () => {
    const missing = await audioProblems(scratch, [recording("p/r.0123456789ab.m4a")], answer(404, {}) as unknown as typeof fetch);
    expect(missing[0]).toContain("HTTP 404, not 206");
    const noCors = await audioProblems(
      scratch,
      [recording("p/r.0123456789ab.m4a")],
      answer(206, { ...good, "access-control-allow-origin": "", "cache-control": "no-cache" }) as unknown as typeof fetch,
    );
    expect(noCors[0]).toContain("Access-Control-Allow-Origin");
    expect(noCors[0]).toContain("Cache-Control no-cache");
  });

  it("reports a network failure", async () => {
    const fetchFn = (async () => {
      throw new Error("fetch failed");
    }) as unknown as typeof fetch;
    expect((await audioProblems(scratch, [recording("p/r.0123456789ab.m4a")], fetchFn))[0]).toContain("fetch failed");
  });
});
