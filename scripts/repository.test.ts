import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runInNewContext } from "node:vm";
import { afterAll, expect, it } from "vitest";
import { parseLanguageFile } from "./repository.ts";
import { recordings } from "./recordings.ts";

const scratch = mkdtempSync(join(tmpdir(), "shawared-source-layout-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function put(root: string, path: string, value: unknown) {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n");
}

function fixture() {
  const root = mkdtempSync(join(scratch, "root-"));
  put(root, "content/poets/poet/poet.json", { id: "poet", name: "شاعر" });
  put(root, "content/poets/poet/en.json", { lang: "en", name: "Poet" });
  put(root, "content/reciters/reader/reciter.json", { id: "reader", name: "قارئ" });
  put(root, "content/poems/poem/poem.json", {
    id: "poem",
    poet: "poet",
    title: "قصيدة",
    meter: "tawil",
    themes: ["theme"],
    abyat_in_full: 1,
    added: "2026-01-01",
    abyat: [{ n: 1, sadr: "قالَ", ajuz: "قالَ" }],
  });
  put(root, "content/poems/poem/sources.md", "A synthetic source fixture.\n");
  put(root, "content/poems/poem/en.json", { lang: "en", source: { name: "Default" }, title: "Default title", intro: "Default intro" });
  put(root, "content/themes.json", {
    theme: {
      name: { ar: "غرض", en: "Theme" },
      definition: { ar: "تعريف", en: "Definition" },
      example: { poem: "poem", bayt: 1 },
      references: ["https://example.com/theme"],
    },
  });
  put(root, "content/poems/README.md", "Files beside poem directories are not poems.\n");
  return root;
}

const read = (root: string, path: string) => JSON.parse(readFileSync(join(root, path), "utf8"));
const run = (root: string, script: string, ...args: string[]) =>
  spawnSync("bun", [join(import.meta.dirname, script), ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, SHAWARED_ROOT: root },
  });

it("recognizes base and named language sources without admitting malformed filenames", () => {
  expect(parseLanguageFile("ar.json")).toEqual({ lang: "ar" });
  expect(parseLanguageFile("en.edition-2.json")).toEqual({ lang: "en", source: "edition-2" });
  for (const name of ["poem.json", "en..json", "en.Edition.json", "en.edition_2.json", "en.one.two.json", "EN.json", "en.json.bak"])
    expect(parseLanguageFile(name), name).toBeNull();
});

it("reports malformed names and language mismatches before publishing anything", () => {
  const root = fixture();
  for (const name of ["english.json", "en..json", "en.wrong_source.json", "AR.json"]) put(root, `content/poems/poem/${name}`, "not JSON");
  put(root, "content/poems/poem/fr.json", { lang: "en", source: { name: "Wrong language" }, intro: "Text" });
  put(root, "content/poets/poet/en.named.json", { lang: "en", name: "Poet" });
  put(root, "content/poets/poet/fr.json", { lang: "en", name: "Poet" });

  const checked = run(root, "check.ts");
  expect(checked.status, checked.stdout + checked.stderr).toBe(1);
  for (const name of ["english.json", "en..json", "en.wrong_source.json", "AR.json"])
    expect(checked.stdout).toContain(`content/poems/poem/${name}: language files are named like en.json or en.<source>.json`);
  expect(checked.stdout).toContain("content/poets/poet/en.named.json: language files are named like en.json");
  expect(checked.stdout).toContain('content/poems/poem/fr.json [lang]: lang is "en" but the file is fr.json');
  expect(checked.stdout).toContain('content/poets/poet/fr.json [lang]: lang is "en" but the file is fr.json');

  const published = run(root, "build-content.ts", "--remote-audio");
  expect(published.status).toBe(1);
  expect(published.stderr).toContain("content check failed; nothing published");
  expect(existsSync(join(root, "apps/app/public/content"))).toBe(false);
});

it("publishes sources by existing precedence and recitations by filename within the selected root", () => {
  const root = fixture();
  for (const source of ["zz", "aaa", "z", "a"])
    put(root, `content/poems/poem/en.${source}.json`, {
      lang: "en",
      source: { name: source },
      title: `${source} title`,
      intro: `${source} intro`,
    });
  for (const recitation of ["z", "a"])
    put(root, `content/poems/poem/recitations/${recitation}.json`, {
      reciter: "reader",
      audio: `poem/${recitation}.m4a`,
      duration: 2,
      timeline: [["1", 0, 1]],
    });
  put(root, "content/poems/poem/recitations/notes.md", "Not a recitation.\n");

  const result = run(root, "build-content.ts", "--remote-audio");
  expect(result.status, result.stdout + result.stderr).toBe(0);
  const bundle = read(root, "apps/app/public/content/v1/poems/poem/en.json");
  const catalog = read(root, "apps/app/public/content/v1/catalog.json");
  expect(bundle.sources.map((source: { id: string }) => source.id)).toEqual(["en", "en.a", "en.z", "en.zz", "en.aaa"]);
  expect(catalog.poems).toHaveLength(1);
  expect(catalog.poems[0].titles.en).toBe("Default title");
  expect(catalog.poets.poet.names.en).toBe("Poet");
  expect(bundle.recitations.map((recitation: { id: string }) => recitation.id)).toEqual(["a", "z"]);
  expect(recordings(root).map((recording) => recording.recitation)).toEqual(["a", "z"]);

  const preview = run(root, "preview.ts", "poem");
  expect(preview.status, preview.stderr).toBe(0);
  const html = readFileSync(join(root, "media/preview/poem.html"), "utf8");
  const fragments: string[] = [];
  const nodes: Record<string, object> = {
    "#audio": {},
    "#title": {},
    "#meta": {},
    "#main": {
      addEventListener() {},
      insertAdjacentHTML(_where: string, fragment: string) {
        fragments.push(fragment);
      },
    },
  };
  runInNewContext(/<script>([\s\S]*?)<\/script>/.exec(html)![1]!, {
    document: { querySelector: (selector: string) => nodes[selector], querySelectorAll: () => [] },
    addEventListener() {},
    requestAnimationFrame() {},
  });
  expect(
    fragments
      .filter((fragment) => fragment.startsWith('<section class="card'))
      .map((fragment) => /<p[^>]*>([^<]+)<\/p>/.exec(fragment)?.[1]),
  ).toEqual(["a intro", "aaa intro", "Default intro", "z intro", "zz intro"]);
});

it.each(["absent", "a file"])("accepts a poem when its optional recitations directory is %s", (kind) => {
  const root = fixture();
  if (kind === "a file") put(root, "content/poems/poem/recitations", "No recordings yet.\n");
  const checked = run(root, "check.ts");
  expect(checked.status, checked.stdout + checked.stderr).toBe(0);
  expect(checked.stdout).toContain("content/poems/poem: no recitations");
  const result = run(root, "build-content.ts", "--remote-audio");
  expect(result.status, result.stdout + result.stderr).toBe(0);
  expect(read(root, "apps/app/public/content/v1/poems/poem/ar.json").recitations).toEqual([]);
  expect(recordings(root)).toEqual([]);
});

it("authoring commands update every valid language source while leaving malformed names alone", () => {
  const root = fixture();
  const poem = read(root, "content/poems/poem/poem.json");
  poem.abyat[0].sadr = "قَالَ";
  put(root, "content/poems/poem/poem.json", poem);
  for (const [file, lang] of [
    ["ar.json", "ar"],
    ["en.edition-2.json", "en"],
  ])
    put(root, `content/poems/poem/${file}`, {
      lang,
      source: { name: "Notes" },
      words: { "1.1.1": { word: "", head: "قَالَ", meaning: "Meaning" } },
    });
  const ignored = "not JSON and must not be touched\n";
  put(root, "content/poems/poem/en.Bad.json", ignored);

  const notes = run(root, "notes.ts", "poem");
  expect(notes.status, notes.stderr).toBe(0);
  for (const file of ["ar.json", "en.edition-2.json"]) expect(read(root, `content/poems/poem/${file}`).words["1.1.1"].word).toBe("قَالَ");

  const tashkeel = run(root, "tashkeel.ts", "poem", "--fix");
  expect(tashkeel.status, tashkeel.stderr).toBe(0);
  expect(read(root, "content/poems/poem/poem.json").abyat[0].sadr).toBe("قالَ");
  for (const file of ["ar.json", "en.edition-2.json"])
    expect(read(root, `content/poems/poem/${file}`).words["1.1.1"]).toMatchObject({ word: "قالَ", head: "قالَ" });

  const layout = run(root, "layout.ts", "poem");
  expect(layout.status, layout.stderr).toBe(0);
  for (const file of ["ar.json", "en.edition-2.json"])
    expect(readFileSync(join(root, `content/poems/poem/${file}`), "utf8")).toContain(
      '"1.1.1": { "word": "قالَ", "head": "قالَ", "meaning": "Meaning" }',
    );
  expect(readFileSync(join(root, "content/poems/poem/en.Bad.json"), "utf8")).toBe(ignored);
});
