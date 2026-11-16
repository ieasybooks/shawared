// Publishes content/ as the files the app downloads: a catalog plus one bundle
// per poem per language (see packages/contracts/src/published.ts). Runs the
// checker first and refuses to publish content that fails it.
//
//   bun scripts/build-content.ts [--out <dir>] [--audio-out <dir>]
//
// Defaults write into the app's public/ folder, so the web app serves them.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import {
  bundlePath,
  Catalog,
  catalogPath,
  PoemBundle,
  SCHEMA,
  source,
  UI_LANGS,
  type CatalogPerson,
  type CatalogPoem,
  type PublishedSource,
} from "@shawared/contracts";

const ROOT = join(import.meta.dir, "..");
const CONTENT = join(ROOT, "content");
const { values: args } = parseArgs({
  options: { out: { type: "string" }, "audio-out": { type: "string" }, "skip-check": { type: "boolean" } },
});
const OUT = args.out ?? join(ROOT, "apps/app/public/content");
const AUDIO_OUT = args["audio-out"] ?? join(ROOT, "apps/app/public/audio");

if (!args["skip-check"]) {
  const r = spawnSync("bun", [join(ROOT, "scripts/check.ts")], { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });
  if (r.status !== 0) {
    process.stdout.write(r.stdout);
    console.error("content check failed; nothing published");
    process.exit(1);
  }
}

const read = (f: string): unknown => JSON.parse(readFileSync(f, "utf8"));
const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory();
const dirs = (p: string) =>
  isDir(p)
    ? readdirSync(p)
        .filter((d) => isDir(join(p, d)))
        .sort()
    : [];
const langFiles = (dir: string, main: string) =>
  readdirSync(dir)
    .filter((f) => f !== main && /^[a-z]{2}(\.[a-z0-9-]+)?\.json$/.test(f))
    .sort((a, b) => a.length - b.length || a.localeCompare(b));

type Person = {
  main: { id: string; name: string; died?: { hijri: number; ce: number }; links?: Record<string, string> };
  langs: Record<string, { name?: string; bio?: string }>;
};
function people(kind: "poets" | "reciters"): Map<string, Person> {
  const out = new Map<string, Person>();
  for (const id of dirs(join(CONTENT, kind))) {
    const dir = join(CONTENT, kind, id);
    const mainFile = kind === "poets" ? "poet.json" : "reciter.json";
    const main = (kind === "poets" ? source.Poet : source.Reciter).parse(read(join(dir, mainFile)));
    const langs: Person["langs"] = {};
    for (const f of langFiles(dir, mainFile)) {
      const l = source.PersonLang.parse(read(join(dir, f)));
      langs[l.lang] = { ...(l.name ? { name: l.name } : {}), ...(l.bio ? { bio: l.bio } : {}) };
    }
    out.set(id, { main, langs });
  }
  return out;
}

const catalogPerson = (p: Person): CatalogPerson => ({
  id: p.main.id,
  name: p.main.name,
  names: Object.fromEntries(Object.entries(p.langs).flatMap(([l, v]) => (v.name ? [[l, v.name]] : []))),
  ...(p.main.died ? { died: p.main.died } : {}),
});
const nameIn = (p: Person, lang: string) => p.langs[lang]?.name ?? p.main.name;

const poets = people("poets");
const reciters = people("reciters");
const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);

rmSync(join(OUT, `v${SCHEMA}`), { recursive: true, force: true });
const write = (rel: string, data: unknown) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  const text = JSON.stringify(data);
  writeFileSync(file, text);
  return text;
};

const catalogPoems: CatalogPoem[] = [];
let audioCopied = 0;
const audioMissing: string[] = [];

for (const id of dirs(join(CONTENT, "poems"))) {
  const dir = join(CONTENT, "poems", id);
  const poem = source.Poem.parse(read(join(dir, "poem.json")));
  const poet = poets.get(poem.poet)!;

  const byLang = new Map<string, PublishedSource[]>();
  for (const f of langFiles(dir, "poem.json")) {
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
  const recitations = (
    isDir(recDir)
      ? readdirSync(recDir)
          .filter((f) => f.endsWith(".json"))
          .sort()
      : []
  ).map((f) => {
    const r = source.Recitation.parse(read(join(recDir, f)));
    return { id: f.replace(/\.json$/, ""), reciter: r.reciter, audio: r.audio, duration: r.duration, timeline: r.timeline };
  });

  for (const r of recitations) {
    const from = join(ROOT, "media/audio", r.audio);
    if (!existsSync(from)) {
      audioMissing.push(r.audio);
      continue;
    }
    const to = join(AUDIO_OUT, r.audio);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    audioCopied++;
  }

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
        ...(poem.rawiy ? { rawiy: poem.rawiy } : {}),
        abyat_in_full: poem.abyat_in_full,
        abyat: poem.abyat,
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
    ...(poem.rawiy ? { rawiy: poem.rawiy } : {}),
    abyat: poem.abyat.length,
    abyat_in_full: poem.abyat_in_full,
    opening: poem.abyat[0]!,
    langs: [...byLang.keys()],
    recitations: recitations.map((r) => ({ id: r.id, reciter: r.reciter, duration: r.duration })),
    hash: hash(texts.join("\n")),
  });
}

const catalog = Catalog.parse({
  schema: SCHEMA,
  poems: catalogPoems,
  poets: Object.fromEntries([...poets].map(([id, p]) => [id, catalogPerson(p)])),
  reciters: Object.fromEntries([...reciters].map(([id, p]) => [id, catalogPerson(p)])),
});
write(catalogPath(), catalog);

console.log(`published ${catalogPoems.length} poem${catalogPoems.length === 1 ? "" : "s"} to ${OUT}; audio: ${audioCopied} copied`);
if (audioMissing.length) console.warn(`audio not found in media/audio: ${audioMissing.join(", ")}`);
