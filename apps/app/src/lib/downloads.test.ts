import { bundlePath, type PoemBundle } from "@shawared/contracts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fs = vi.hoisted(() => ({
  files: new Map<string, string>(),
  dirs: new Set<string>(),
  failAudio: false,
  failContentWrite: false,
}));

vi.mock("expo-file-system", () => {
  const join = (parts: (string | { uri: string })[]) =>
    parts
      .map((p) => (typeof p === "string" ? p : p.uri))
      .join("/")
      .replace(/\/+$/, "");
  class Directory {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = join(parts);
    }
    get name() {
      return this.uri.split("/").at(-1)!;
    }
    get exists() {
      return fs.dirs.has(this.uri);
    }
    create() {
      const parts = this.uri.split("/");
      for (let i = 1; i <= parts.length; i++) fs.dirs.add(parts.slice(0, i).join("/"));
    }
    list(): (Directory | File)[] {
      const direct = (path: string) => path.startsWith(`${this.uri}/`) && !path.slice(this.uri.length + 1).includes("/");
      return [
        ...[...fs.dirs].filter(direct).map((path) => new Directory(path)),
        ...[...fs.files.keys()].filter(direct).map((path) => new File(path)),
      ];
    }
  }
  class File {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = join(parts);
    }
    get name() {
      return this.uri.split("/").at(-1)!;
    }
    get exists() {
      return fs.files.has(this.uri);
    }
    get size() {
      return fs.files.get(this.uri)?.length ?? 0;
    }
    async text() {
      const text = fs.files.get(this.uri);
      if (text === undefined) throw new Error("missing file");
      return text;
    }
    async write(text: string) {
      if (fs.failContentWrite && this.uri.includes("/content/")) throw new Error("disk full");
      fs.files.set(this.uri, text);
    }
    delete() {
      fs.files.delete(this.uri);
    }
    rename(name: string) {
      const text = fs.files.get(this.uri)!;
      fs.files.delete(this.uri);
      this.uri = `${this.uri.slice(0, this.uri.lastIndexOf("/"))}/${name}`;
      fs.files.set(this.uri, text);
    }
    static async downloadFileAsync(
      url: string,
      target: File,
      options: { signal?: AbortSignal; onProgress?: (p: { bytesWritten: number; totalBytes: number }) => void },
    ) {
      fs.files.set(target.uri, "recording");
      if (options.signal?.aborted || (fs.failAudio && !url.endsWith("artwork.png"))) throw new Error("download failed");
      options.onProgress?.({ bytesWritten: 9, totalBytes: 9 });
      return target;
    }
  }
  return { Directory, File, Paths: { document: "file:///documents" } };
});
vi.mock("expo-constants", () => ({ default: { expoConfig: {} } }));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));

const OLD = "p/r.old.m4a";
const KEY = "p/r.new.m4a";
const local = (key: string) => `file:///documents/audio/${key}`;
const poem = (lang: string, audio = KEY): PoemBundle => ({
  schema: 1,
  lang,
  poem: { id: "p", poet: "poet", title: "Poem", meter: "tawil", abyat_in_full: 1, abyat: [{ n: 1, sadr: "أ", ajuz: "ب" }], kashida: {} },
  poet: { id: "poet", name: "Poet" },
  reciters: { r: { id: "r", name: "Reciter" } },
  recitations: [{ id: "r", reciter: "r", audio, duration: 10, timeline: [["1", 1, 9]] }],
  sources: [],
});

beforeEach(() => {
  vi.resetModules();
  fs.files.clear();
  fs.dirs.clear();
  fs.dirs.add("file:///documents/audio");
  fs.dirs.add("file:///documents/audio/p");
  fs.files.set(local(OLD), "old recording");
  fs.failAudio = false;
  fs.failContentWrite = false;
  vi.stubGlobal("__DEV__", false);
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) => new Response(JSON.stringify(poem(url.endsWith("/en.json") ? "en" : "ar")), { headers: { etag: "bundle-v2" } }),
    ),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("offline download completion", () => {
  it("publishes complete audio and both retained texts before removing its previous recording", async () => {
    const { download, localAudio } = await import("./downloads");
    const { readCached } = await import("./diskCache");
    expect(await download("p", KEY, ["ar", "en"])).toBe(true);
    expect(localAudio(KEY)).toBe(local(KEY));
    expect(localAudio(OLD)).toBeNull();
    expect(fs.files.has(local(`${KEY}.part`))).toBe(false);
    for (const lang of ["ar", "en"]) {
      const kept = await readCached(bundlePath("p", lang));
      expect(JSON.parse(kept!.text)).toMatchObject({ lang, recitations: [{ audio: KEY }] });
    }
  });

  it("does not mark audio downloaded when a required text failed to load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("offline", { status: 503 })),
    );
    const { download, localAudio } = await import("./downloads");
    expect(await download("p", KEY, ["ar"])).toBe(false);
    expect(localAudio(KEY)).toBeNull();
    expect(localAudio(OLD)).toBe(local(OLD));
    expect(fs.files.has(local(`${KEY}.part`))).toBe(false);
  });

  it("distinguishes text available to a screen from text actually retained on disk", async () => {
    fs.failContentWrite = true;
    const { download, localAudio } = await import("./downloads");
    const { loadPoem } = await import("./content");
    expect(await download("p", KEY, ["ar"])).toBe(false);
    expect((await loadPoem("p", "ar"))?.poem.id).toBe("p");
    expect(localAudio(KEY)).toBeNull();
    expect(localAudio(OLD)).toBe(local(OLD));
  });

  it("keeps the previous recording if replacement audio fails without using it for the new key", async () => {
    fs.failAudio = true;
    const { download, localAudio } = await import("./downloads");
    expect(await download("p", KEY, ["ar"])).toBe(false);
    expect(localAudio(OLD)).toBe(local(OLD));
    expect(localAudio(KEY)).toBeNull();
    expect(fs.files.has(local(`${KEY}.part`))).toBe(false);
  });

  it("requires the retained timing bundle to name the downloaded recording's exact key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(poem("ar", OLD)))),
    );
    const { download, localAudio } = await import("./downloads");
    expect(await download("p", KEY, ["ar"])).toBe(false);
    expect(localAudio(KEY)).toBeNull();
    expect(localAudio(OLD)).toBe(local(OLD));
  });

  it("discovers finished recordings and removes interrupted partial files on the first read", async () => {
    fs.files.set(local(`${KEY}.part`), "incomplete");
    const { localAudio } = await import("./downloads");
    expect(localAudio(OLD)).toBe(local(OLD));
    expect(localAudio(KEY)).toBeNull();
    expect(fs.files.has(local(`${KEY}.part`))).toBe(false);
  });
});
