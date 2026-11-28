// Publishes content/ as the files the app downloads: a catalog, one bundle per
// poem per language, and one page per poet and reciter per language (see
// packages/contracts/src/published.ts). Runs the
// checker first and refuses to publish content that fails it.
//
//   bun scripts/build-content.ts [--out <dir>] [--audio-out <dir>] [--remote-audio]
//
// Defaults write into the app's public/ folder, so the web app serves them.
// Audio from earlier runs is cleared first. Each recording with its source in
// media/audio is then copied to its key (scripts/recordings.ts), for local
// previews; with --remote-audio, for release builds that play audio from
// audio.shawared.com, none is.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import {
  bundlePath,
  Catalog,
  catalogPath,
  PersonBundle,
  personPath,
  PoemBundle,
  SCHEMA,
  source,
  UI_LANGS,
  type CatalogPerson,
  type CatalogPoem,
  type CatalogTheme,
  type PublishedSource,
} from "@shawared/contracts";
import { sourcePath } from "./recordings.ts";
import { directories, jsonFiles, languageFiles, root } from "./repository.ts";
import { planPoem } from "./kashida.ts";

const ROOT = root();
const CONTENT = join(ROOT, "content");
const { values: args } = parseArgs({
  options: {
    out: { type: "string" },
    "audio-out": { type: "string" },
    "remote-audio": { type: "boolean" },
    "skip-check": { type: "boolean" },
  },
});
const OUT = args.out ?? join(ROOT, "apps/app/public/content");
const AUDIO_OUT = args["audio-out"] ?? join(ROOT, "apps/app/public/audio");

if (!args["skip-check"]) {
  const r = spawnSync("bun", [join(import.meta.dir, "check.ts")], { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });
  if (r.status !== 0) {
    process.stdout.write(r.stdout);
    console.error("content check failed; nothing published");
    process.exit(1);
  }
}

const read = (f: string): unknown => JSON.parse(readFileSync(f, "utf8"));
const sourceOrder = (a: string, b: string) => a.length - b.length || a.localeCompare(b);

type Person = {
  main: {
    id: string;
    name: string;
    era?: string;
    full_name?: string;
    died?: { hijri: number; ce: number };
    links?: Record<string, string>;
  };
  langs: Record<string, { name?: string; bio?: string }>;
};
function people(kind: "poets" | "reciters"): Map<string, Person> {
  const out = new Map<string, Person>();
  for (const id of directories(join(CONTENT, kind))) {
    const dir = join(CONTENT, kind, id);
    const mainFile = kind === "poets" ? "poet.json" : "reciter.json";
    const main = (kind === "poets" ? source.Poet : source.Reciter).parse(read(join(dir, mainFile)));
    const langs: Person["langs"] = {};
    for (const f of languageFiles(dir).sort(sourceOrder)) {
      const l = source.PersonLang.parse(read(join(dir, f)));
      langs[l.lang] = { ...(l.name ? { name: l.name } : {}), ...(l.bio ? { bio: l.bio } : {}) };
    }
    out.set(id, { main, langs });
  }
  return out;
}

const personBasics = (p: Person) => ({
  id: p.main.id,
  name: p.main.name,
  names: Object.fromEntries(Object.entries(p.langs).flatMap(([l, v]) => (v.name ? [[l, v.name]] : []))),
  ...(p.main.died ? { died: p.main.died } : {}),
});
const catalogPerson = (p: Person, poems: number): CatalogPerson => ({
  ...personBasics(p),
  ...(p.main.era ? { era: p.main.era } : {}),
  poems,
});
const nameIn = (p: Person, lang: string) => p.langs[lang]?.name ?? p.main.name;

const poets = people("poets");
const reciters = people("reciters");
const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);

rmSync(join(OUT, `v${SCHEMA}`), { recursive: true, force: true });
// Audio from an earlier run, which a release build mustn't carry.
rmSync(AUDIO_OUT, { recursive: true, force: true });
const remoteAudio = args["remote-audio"] === true;
const write = (rel: string, data: unknown) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  const text = JSON.stringify(data);
  writeFileSync(file, text);
  return text;
};

const catalogPoems: CatalogPoem[] = [];
const themes = source.Themes.parse(read(join(CONTENT, "themes.json")));
const examples = new Map<string, CatalogTheme["example"]>();
let audioCopied = 0;
const audioMissing: string[] = [];
const wideSpaces: string[] = [];

for (const id of directories(join(CONTENT, "poems"))) {
  const dir = join(CONTENT, "poems", id);
  const poem = source.Poem.parse(read(join(dir, "poem.json")));
  const poet = poets.get(poem.poet)!;

  const byLang = new Map<string, PublishedSource[]>();
  for (const f of languageFiles(dir).sort(sourceOrder)) {
    const l = source.PoemLang.parse(read(join(dir, f)));
    const src: PublishedSource = {
      id: f.replace(/\.json$/, ""),
      name: l.source.name,
      ...(l.title ? { title: l.title } : {}),
      ...(l.intro ? { intro: l.intro } : {}),
      abyat: l.abyat,
      words: l.words,
    };
    byLang.set(l.lang, [...(byLang.get(l.lang) ?? []), src]);
  }

  const recDir = join(dir, "recitations");
  const recitations = jsonFiles(recDir).map((f) => {
    const r = source.Recitation.parse(read(join(recDir, f)));
    return { id: f.replace(/\.json$/, ""), reciter: r.reciter, audio: r.audio, duration: r.duration, timeline: r.timeline };
  });

  for (const r of remoteAudio ? [] : recitations) {
    const from = sourcePath(ROOT, id, r.id);
    if (!existsSync(from)) {
      audioMissing.push(`${id}/${r.id}.m4a`);
      continue;
    }
    const to = join(AUDIO_OUT, r.audio);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    audioCopied++;
  }

  const layout = planPoem(poem.abyat);
  const primary = poem.themes[0]!;
  const example = themes[primary]!.example!;
  if (example.poem === id) {
    const bayt = poem.abyat.find((b) => b.n === example.bayt)!;
    examples.set(primary, {
      poem: id,
      bayt,
      measure: layout.measure,
      kashida: Object.fromEntries(Object.entries(layout.kashida).filter(([address]) => address.startsWith(`${bayt.n}.`))),
    });
  }
  for (const w of layout.wide) wideSpaces.push(`${id} ${w.address} (spaces ×${w.spaceScale.toFixed(1)})`);

  const langs = [...new Set([...UI_LANGS, ...byLang.keys()])];
  const texts: string[] = [];
  for (const lang of langs) {
    const bundle = PoemBundle.parse({
      schema: SCHEMA,
      lang,
      poem: {
        id: poem.id,
        poet: poem.poet,
        title: poem.title,
        meter: poem.meter,
        ...(lang === "ar" || lang === "en" ? { themes: poem.themes.map((id) => ({ id, name: themes[id]!.name[lang] })) } : {}),
        ...(poem.rawiy ? { rawiy: poem.rawiy } : {}),
        abyat_in_full: poem.abyat_in_full,
        abyat: poem.abyat,
        measure: layout.measure,
        kashida: layout.kashida,
      },
      sources: byLang.get(lang) ?? [],
      recitations,
      poet: { id: poet.main.id, name: nameIn(poet, lang), ...(poet.langs[lang]?.bio ? { bio: poet.langs[lang]!.bio } : {}) },
      reciters: Object.fromEntries(
        recitations.map((r) => {
          const p = reciters.get(r.reciter)!;
          return [r.reciter, { id: p.main.id, name: nameIn(p, lang), ...(p.main.links ? { links: p.main.links } : {}) }];
        }),
      ),
    });
    texts.push(write(bundlePath(id, lang), bundle));
  }

  const titles: Record<string, string> = {};
  for (const [lang, srcs] of byLang) {
    const t = srcs.find((s) => s.title)?.title;
    if (t) titles[lang] = t;
  }
  catalogPoems.push({
    id,
    title: poem.title,
    titles,
    poet: poem.poet,
    meter: poem.meter,
    theme: primary,
    ...(poem.rawiy ? { rawiy: poem.rawiy } : {}),
    abyat: poem.abyat.length,
    abyat_in_full: poem.abyat_in_full,
    added: poem.added,
    opening: poem.abyat[0]!,
    langs: [...byLang.keys()],
    recitations: recitations.map((r) => ({ id: r.id, reciter: r.reciter, duration: r.duration, audio: r.audio })),
    hash: hash(texts.join("\n")),
    measure: layout.measure,
    kashida: Object.fromEntries(Object.entries(layout.kashida).filter(([address]) => address.startsWith(`${poem.abyat[0]!.n}.`))),
  });
}

catalogPoems.sort((a, b) => b.added.localeCompare(a.added) || a.id.localeCompare(b.id));

const poemsOf = (kind: "poets" | "reciters", id: string) =>
  catalogPoems.filter((c) => (kind === "poets" ? c.poet === id : c.recitations.some((r) => r.reciter === id))).map((c) => c.id);
const meters: Record<string, number> = {};
for (const c of catalogPoems) meters[c.meter] = (meters[c.meter] ?? 0) + 1;

const catalog = Catalog.parse({
  schema: SCHEMA,
  poems: catalogPoems,
  poets: Object.fromEntries([...poets].map(([id, p]) => [id, catalogPerson(p, poemsOf("poets", id).length)])),
  reciters: Object.fromEntries([...reciters].map(([id, p]) => [id, catalogPerson(p, poemsOf("reciters", id).length)])),
  meters,
  themes: Object.fromEntries(
    [...examples].map(([id, example]) => [
      id,
      {
        name: themes[id]!.name,
        definition: themes[id]!.definition,
        poems: catalogPoems.filter((p) => p.theme === id).length,
        example,
      },
    ]),
  ),
});
write(catalogPath(), catalog);

for (const [kind, map] of [
  ["poets", poets],
  ["reciters", reciters],
] as const) {
  for (const [id, p] of map) {
    const poems = poemsOf(kind, id);
    for (const lang of UI_LANGS) {
      const bio = p.langs[lang]?.bio;
      write(
        personPath(kind, id, lang),
        PersonBundle.parse({
          schema: SCHEMA,
          lang,
          person: {
            ...personBasics(p),
            ...(p.main.full_name ? { full_name: p.main.full_name } : {}),
            ...(bio ? { bio } : {}),
            ...(p.main.links ? { links: p.main.links } : {}),
          },
          poems,
        }),
      );
    }
  }
}

console.log(
  `published ${catalogPoems.length} poem${catalogPoems.length === 1 ? "" : "s"} to ${OUT}; audio: ${remoteAudio ? "none, played from audio.shawared.com" : `${audioCopied} copied`}`,
);
if (audioMissing.length) console.warn(`audio not found in media/audio: ${audioMissing.join(", ")}`);
if (wideSpaces.length) console.log(`halves whose spaces more than double at the measure (have a look): ${wideSpaces.join(", ")}`);
