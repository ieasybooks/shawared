import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { parseAudioKey } from "@shawared/contracts";
import { hashOf, keyFor, recordings, sourcePath } from "./recordings.ts";
import { uploadAudio, withKey, type Bucket } from "./upload-audio.ts";
import { audioProblems } from "./verify-audio.ts";

const REPO = join(import.meta.dirname, "..");
const scratch = mkdtempSync(join(tmpdir(), "shawared-audio-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function contentFixture(): string {
  const root = mkdtempSync(join(scratch, "root-"));
  const put = (path: string, value: unknown) => {
    const file = join(root, "content", path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
  };
  put("poets/poet/poet.json", { id: "poet", name: "شاعر" });
  put("poets/poet/en.json", { lang: "en", name: "Poet" });
  put("reciters/reader/reciter.json", { id: "reader", name: "قارئ" });
  put("reciters/reader/en.json", { lang: "en", name: "Reader" });
  put("themes.json", {
    theme: {
      name: { ar: "غرض", en: "Theme" },
      definition: { ar: "تعريف", en: "Definition" },
      example: { poem: "local-poem", bayt: 1 },
      references: ["https://example.com/theme"],
    },
  });
  for (const id of ["local-poem", "remote-poem"]) {
    put(`poems/${id}/poem.json`, {
      id,
      poet: "poet",
      title: "قصيدة",
      meter: "tawil",
      themes: ["theme"],
      abyat_in_full: 1,
      added: "2026-01-01",
      abyat: [{ n: 1, sadr: "قالَ", ajuz: "قالَ" }],
    });
    put(`poems/${id}/en.json`, {
      lang: "en",
      source: { name: "Fixture translation" },
      title: "Poem",
      abyat: { "1": { translation: ["First half.", "Second half."] } },
    });
  }
  put("poems/local-poem/recitations/take.json", {
    reciter: "reader",
    audio: "local-poem/take.m4a",
    duration: 2,
    source: "https://example.com/local-recording",
    timeline: [["1", 0, 2]],
  });
  put("poems/remote-poem/recitations/second-take.json", {
    reciter: "reader",
    audio: "remote-poem/second-take.0123456789ab.m4a",
    duration: 2,
    timeline: [["1", 0, 2]],
  });
  return root;
}

function localRecording(root: string) {
  const r = recordings(root).find((recording) => recording.poem === "local-poem")!;
  const source = sourcePath(root, r.poem, r.recitation);
  mkdirSync(dirname(source), { recursive: true });
  const ffmpeg = spawnSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=44100:cl=mono",
    "-t",
    String(r.duration),
    "-c:a",
    "aac",
    "-b:a",
    "32k",
    "-y",
    source,
  ]);
  if (ffmpeg.status !== 0) throw new Error("ffmpeg couldn't make the test recording");
  return r;
}

function memoryBucket(): Bucket & { objects: Map<string, Uint8Array> } {
  const objects = new Map<string, Uint8Array>();
  return { objects, exists: async (key) => objects.has(key), put: async (key, bytes) => void objects.set(key, bytes) };
}

const run = (root: string, script: string, ...args: string[]) =>
  spawnSync("bun", [join(REPO, "scripts", script), ...args], { encoding: "utf8", env: { ...process.env, SHAWARED_ROOT: root } });

describe("keys", () => {
  it("name a recording before and after its upload", () => {
    expect(parseAudioKey("taqulu-buthaynatu/osama-alwaaedh.m4a")).toEqual({ poem: "taqulu-buthaynatu", recitation: "osama-alwaaedh" });
    expect(parseAudioKey("taqulu-buthaynatu/osama-alwaaedh.0123456789ab.m4a")).toEqual({
      poem: "taqulu-buthaynatu",
      recitation: "osama-alwaaedh",
      hash: "0123456789ab",
    });
    for (const bad of ["x.m4a", "a/b.0123456789AB.m4a", "a/b.0123.m4a", "a/b/c.m4a", "a/b.mp3"]) expect(parseAudioKey(bad), bad).toBeNull();
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
    const root = contentFixture();
    const r = localRecording(root);
    const source = sourcePath(root, r.poem, r.recitation);
    const key = keyFor(r.poem, r.recitation, readFileSync(source));
    const before = readFileSync(r.file, "utf8");

    const unuploaded = run(root, "check.ts");
    expect(unuploaded.status, unuploaded.stdout + unuploaded.stderr).toBe(0);
    expect(unuploaded.stdout).toContain("audio isn't uploaded yet");

    const others = ["media/audio/remote-poem/second-take.m4a"];
    const bucket = memoryBucket();
    const first = await uploadAudio(root, bucket, () => {});
    expect(first).toEqual({ uploaded: [key], present: [], updated: [r.file.slice(root.length + 1)], noSource: others });
    expect(Buffer.from(bucket.objects.get(key)!).equals(readFileSync(source))).toBe(true);
    const after = readFileSync(r.file, "utf8");
    expect(after).toBe(before.replace(`"audio": "${r.audio}"`, `"audio": "${key}"`));

    expect(await uploadAudio(root, bucket, () => {})).toEqual({ uploaded: [], present: [key], updated: [], noSource: others });

    const uploaded = run(root, "check.ts");
    expect(uploaded.status, uploaded.stdout + uploaded.stderr).toBe(0);
    const mine = r.file.slice(root.length + 1);
    expect(uploaded.stdout).not.toContain(`${mine} [audio]: audio isn't uploaded yet`);
    expect(uploaded.stdout).not.toContain(`${mine} [audio]: audio not found`);

    const out = join(root, "public");
    const preview = run(root, "build-content.ts", "--out", join(out, "content"), "--audio-out", join(out, "audio"));
    expect(preview.status, preview.stderr).toBe(0);
    expect(readFileSync(join(out, "audio", key))).toEqual(readFileSync(source));
    const bundle = JSON.parse(readFileSync(join(out, "content/v1/poems", r.poem, "ar.json"), "utf8"));
    expect(bundle.recitations[0].audio).toBe(key);

    const release = run(root, "build-content.ts", "--out", join(out, "content"), "--audio-out", join(out, "audio"), "--remote-audio");
    expect(release.status, release.stderr).toBe(0);
    expect(existsSync(join(out, "audio"))).toBe(false);
  }, 60_000);

  it("refuses a source that isn't the uploaded recording", async () => {
    const root = contentFixture();
    const r = localRecording(root);
    await uploadAudio(root, memoryBucket(), () => {});
    writeFileSync(sourcePath(root, r.poem, r.recitation), new Uint8Array([1, 2, 3]));
    const result = run(root, "check.ts");
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("isn't the uploaded recording");
  }, 60_000);

  it("leaves recordings without a source alone", async () => {
    const root = contentFixture();
    const before = recordings(root).map((r) => ({ file: r.file, text: readFileSync(r.file, "utf8") }));
    const result = await uploadAudio(root, memoryBucket(), () => {});
    expect(result).toEqual({
      uploaded: [],
      present: [],
      updated: [],
      noSource: ["media/audio/local-poem/take.m4a", "media/audio/remote-poem/second-take.m4a"],
    });
    for (const r of before) expect(readFileSync(r.file, "utf8")).toBe(r.text);
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

  it("asks again when the connection drops, and reports a network failure that lasts", async () => {
    const slept: number[] = [];
    const sleep = async (ms: number) => void slept.push(ms);
    let calls = 0;
    const dropsOnce = (async () => {
      if (++calls === 1) throw new Error("ECONNRESET: The socket connection was closed unexpectedly");
      return answer(206, good)();
    }) as unknown as typeof fetch;
    expect(await audioProblems(scratch, [recording("p/r.0123456789ab.m4a")], dropsOnce, sleep)).toEqual([]);
    expect(slept).toEqual([2000]);

    slept.length = 0;
    const fetchFn = (async () => {
      throw new Error("fetch failed");
    }) as unknown as typeof fetch;
    const [problem] = await audioProblems(scratch, [recording("p/r.0123456789ab.m4a")], fetchFn, sleep);
    expect(problem).toContain("fetch failed (after 3 tries)");
    expect(slept).toEqual([2000, 2000]);
  });

  it("doesn't ask again for a wrong answer", async () => {
    let calls = 0;
    const fetchFn = (async () => {
      calls++;
      return answer(404, {})();
    }) as unknown as typeof fetch;
    await audioProblems(scratch, [recording("p/r.0123456789ab.m4a")], fetchFn, async () => {});
    expect(calls).toBe(1);
  });
});
