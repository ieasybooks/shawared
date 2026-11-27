// Checks every file under content/ and prints a coverage report.
//
//   bun scripts/check.ts            all poems
//   bun scripts/check.ts <poem-id>  one poem
//
// Exits with 1 when there is an error. Warnings don't fail the check.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import type { z } from "zod";
import { houseStyle, parseAudioKey, parseLineAddress, parseWordAddress, source, tashkeelIssues, wordsOf } from "@shawared/contracts";
import { hashOf, sourcePath } from "./recordings.ts";
import { root } from "./repository.ts";

const { Poem, PoemLang, Recitation, Poet, Reciter, PersonLang } = source;

const ROOT = root();
const CONTENT = join(ROOT, "content");

type Issue = { level: "error" | "warning"; file: string; where?: string; msg: string };
const issues: Issue[] = [];
const rel = (f: string) => relative(ROOT, f);
const error = (file: string, msg: string, where?: string) => issues.push({ level: "error", file: rel(file), where, msg });
const warn = (file: string, msg: string, where?: string) => issues.push({ level: "warning", file: rel(file), where, msg });

// What docs/writing.md asks of the prose: no exclamation marks (a translation may keep one
// inside quoted speech), and in English no ' for an ʿayn or hamza that starts a word
// (Ali, Udhra; Ka'b keeps it).
function proseStyle(file: string, lang: string, text: string, where: string, translation = false) {
  const outsideQuotes = translation ? text.replace(/“[^”]*”/g, "") : text;
  if (outsideQuotes.includes("!")) warn(file, translation ? "an exclamation mark outside quoted speech" : "an exclamation mark", where);
  if (lang !== "en") return;
  for (const m of text.match(/(?<![\p{L}'])'\p{L}+/gu) ?? [])
    warn(file, `«${m}»: drop the ' of an ʿayn or hamza that starts a word (Ali, Udhra)`, where);
}

const nfc = (s: string) => s.normalize("NFC");
const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory();
const dirs = (p: string) =>
  isDir(p)
    ? readdirSync(p)
        .filter((d) => isDir(join(p, d)))
        .sort()
    : [];
const jsonFiles = (p: string) =>
  isDir(p)
    ? readdirSync(p)
        .filter((f) => f.endsWith(".json"))
        .sort()
    : [];

/** Reads and validates one JSON file. Returns null (after reporting) when it can't be used. */
function load<S extends z.ZodType>(file: string, schema: S): z.infer<S> | null {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    error(file, `not valid JSON: ${(e as Error).message}`);
    return null;
  }
  const r = schema.safeParse(raw);
  if (!r.success) {
    for (const i of r.error.issues) error(file, i.message, i.path.join("."));
    return null;
  }
  return r.data;
}

function audioDuration(file: string): number | null {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const d = Number.parseFloat(r.stdout);
  return r.status === 0 && Number.isFinite(d) ? d : null;
}

// ----- people ----------------------------------------------------------------

function checkPeople(kind: "poets" | "reciters", mainName: string, schema: typeof Poet | typeof Reciter) {
  const ids = new Set<string>();
  for (const id of dirs(join(CONTENT, kind))) {
    const dir = join(CONTENT, kind, id);
    const main = join(dir, mainName);
    if (!existsSync(main)) {
      error(dir, `missing ${mainName}`);
      continue;
    }
    const p = load(main, schema);
    if (p && p.id !== id) error(main, `id is "${p.id}" but the folder is "${id}"`, "id");
    ids.add(id);
    for (const f of jsonFiles(dir).filter((f) => f !== mainName)) {
      const file = join(dir, f);
      if (!/^[a-z]{2}\.json$/.test(f)) {
        error(file, "language files are named like en.json");
        continue;
      }
      const l = load(file, PersonLang);
      if (l && l.lang !== f.slice(0, 2)) error(file, `lang is "${l.lang}" but the file is ${f}`, "lang");
      if (l && l.lang !== "ar" && !l.name) warn(file, `no ${l.lang} name`);
    }
  }
  return ids;
}

// ----- poems -----------------------------------------------------------------

type Coverage = { lines: string[] };

function checkPoem(id: string, poets: Set<string>, reciters: Set<string>): Coverage | null {
  const dir = join(CONTENT, "poems", id);
  const pf = join(dir, "poem.json");
  if (!existsSync(pf)) {
    error(dir, "missing poem.json");
    return null;
  }
  const poem = load(pf, Poem);
  if (!poem) return null;

  if (poem.id !== id) error(pf, `id is "${poem.id}" but the folder is "${id}"`, "id");
  if (!poets.has(poem.poet)) error(pf, `no poet "${poem.poet}" in content/poets`, "poet");

  const byN = new Map(poem.abyat.map((b) => [b.n, b]));
  if (themes) {
    for (const theme of poem.themes) {
      if (!Object.hasOwn(themes, theme)) error(pf, `unknown theme "${theme}"`, "themes");
    }
    const primary = poem.themes[0]!;
    if (themes[primary] && !themes[primary].example) error(themesFile, "a primary theme needs a representative bayt", primary);
    for (const [theme, { example }] of Object.entries(themes)) {
      if (example?.poem !== id) continue;
      if (primary !== theme) error(themesFile, `${id} belongs to "${primary}"`, theme);
      if (!byN.has(example.bayt)) error(themesFile, `bayt ${example.bayt} is missing from ${id}`, theme);
    }
  }
  poem.abyat.forEach((b, i) => {
    const prev = poem.abyat[i - 1];
    if (prev && b.n === prev.n) error(pf, `bayt ${b.n} appears twice`, `abyat.${i}.n`);
    else if (prev && b.n < prev.n) error(pf, `bayt ${b.n} comes after bayt ${prev.n}; numbers must go up`, `abyat.${i}.n`);
    if (b.n > poem.abyat_in_full) error(pf, `bayt ${b.n} is past abyat_in_full (${poem.abyat_in_full})`, `abyat.${i}.n`);
  });
  // Harakat in the house style (packages/contracts/src/tashkeel.ts).
  let restyle = 0;
  poem.abyat.forEach((b, i) => {
    for (const [h, text] of [
      [1, b.sadr],
      [2, b.ajuz],
    ] as const) {
      if (houseStyle(text) !== text) restyle++;
      for (const m of tashkeelIssues(text)) warn(pf, m, `abyat.${i} (${b.n}.${h})`);
    }
  });
  if (restyle)
    warn(pf, `${restyle} half${restyle > 1 ? "s" : ""} not in the house style for harakat; run bun scripts/tashkeel.ts ${id} --fix`);
  if (!existsSync(join(dir, "sources.md"))) warn(dir, "no sources.md (the editions used and how each reading was decided)");

  if (poem.abyat.length > poem.abyat_in_full)
    error(pf, `${poem.abyat.length} abyat but abyat_in_full is ${poem.abyat_in_full}`, "abyat_in_full");

  const half = (n: number, h: 1 | 2) => {
    const b = byN.get(n);
    return b ? (h === 1 ? b.sadr : b.ajuz) : undefined;
  };
  const N = poem.abyat.length;
  const cov: string[] = [];
  const head = `${id}  ${poem.title}  ·  ${poem.poet}  ·  ${N} abyat` + (N < poem.abyat_in_full ? ` of ${poem.abyat_in_full}` : "");
  cov.push(head);

  // language files
  const seen = new Map<string, string[]>();
  const langFiles = jsonFiles(dir).filter((f) => f !== "poem.json");
  for (const f of langFiles) {
    const file = join(dir, f);
    const m = /^([a-z]{2})(?:\.([a-z0-9-]+))?\.json$/.exec(f);
    if (!m) {
      error(file, "language files are named like en.json or en.<source>.json");
      continue;
    }
    const l = load(file, PoemLang);
    if (!l) continue;
    if (l.lang !== m[1]) error(file, `lang is "${l.lang}" but the file is ${f}`, "lang");
    const names = seen.get(l.lang) ?? [];
    if (names.includes(l.source.name)) error(file, `another ${l.lang} file already uses the source name "${l.source.name}"`, "source.name");
    seen.set(l.lang, [...names, l.source.name]);

    let tr = 0,
      sh = 0;
    for (const [k, v] of Object.entries(l.abyat)) {
      if (!byN.has(Number(k))) {
        error(file, `bayt ${k} is not in poem.json`, `abyat.${k}`);
        continue;
      }
      if (v.translation) {
        tr++;
        if (l.lang === "ar") error(file, "an Arabic file can't have a translation", `abyat.${k}.translation`);
      }
      if (v.sharh) sh++;
      if (!v.translation && !v.sharh) warn(file, "empty entry", `abyat.${k}`);
      if (v.sharh) proseStyle(file, l.lang, v.sharh, `abyat.${k}.sharh`);
      if (v.translation) [v.translation].flat().forEach((t, i) => proseStyle(file, l.lang, t, `abyat.${k}.translation.${i}`, true));
    }
    if (l.intro) proseStyle(file, l.lang, l.intro, "intro");
    for (const [addr, note] of Object.entries(l.words))
      if (l.lang === "en") proseStyle(file, l.lang, note.meaning, `words.${addr}.meaning`);

    // word notes: address must exist, the Arabic must match, notes must not overlap
    const taken = new Map<string, string>(); // "n.h.w" -> address that uses it
    for (const [addr, note] of Object.entries(l.words)) {
      const a = parseWordAddress(addr)!;
      const text = half(a.n, a.half);
      if (text === undefined) {
        error(file, `bayt ${a.n} is not in poem.json`, `words.${addr}`);
        continue;
      }
      const ws = wordsOf(text);
      if (a.to < a.from) {
        error(file, "range goes backwards", `words.${addr}`);
        continue;
      }
      if (a.to > ws.length) {
        error(file, `that half has only ${ws.length} words`, `words.${addr}`);
        continue;
      }
      const actual = ws.slice(a.from - 1, a.to).join(" ");
      if (nfc(note.word) !== nfc(actual))
        error(file, `word is "${note.word}" but the text at ${addr} is "${actual}"`, `words.${addr}.word`);
      for (let w = a.from; w <= a.to; w++) {
        const key = `${a.n}.${a.half}.${w}`;
        const other = taken.get(key);
        if (other) error(file, `overlaps ${other}; a tap must open one note`, `words.${addr}`);
        else taken.set(key, addr);
      }
    }

    if (!l.title && !l.intro && tr === 0 && sh === 0 && Object.keys(l.words).length === 0) warn(file, "file has no content");
    const label = `${l.lang}${m[2] ? "." + m[2] : ""}`.padEnd(10);
    const parts = [
      `sharh ${sh}/${N}`,
      l.lang === "ar" ? null : `translation ${tr}/${N}`,
      `words ${Object.keys(l.words).length}`,
      l.lang === "ar" ? null : `title ${l.title ? "yes" : "no"}`,
      `intro ${l.intro ? "yes" : "no"}`,
    ].filter(Boolean);
    cov.push(`  ${label} ${l.source.name.padEnd(12)} ${parts.join("  ·  ")}`);
  }
  if (langFiles.length === 0) cov.push("  (no language files)");

  // recitations
  const rdir = join(dir, "recitations");
  const recs = jsonFiles(rdir);
  if (recs.length === 0) warn(dir, "no recitations");
  for (const f of recs) {
    const file = join(rdir, f);
    const rid = f.replace(/\.json$/, "");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(rid)) error(file, "recitation files are named with lowercase latin letters, digits and dashes");
    const r = load(file, Recitation);
    if (!r) continue;
    if (!reciters.has(r.reciter)) error(file, `no reciter "${r.reciter}" in content/reciters`, "reciter");
    // The key is the recording's name before its upload, and its name with the
    // hash after it (scripts/recordings.ts).
    const key = parseAudioKey(r.audio);
    if (!key || key.poem !== id || key.recitation !== rid) {
      error(file, `audio should be "${id}/${rid}.m4a", or once uploaded "${id}/${rid}.<hash>.m4a"`, "audio");
    } else if (!key.hash) {
      warn(file, "audio isn't uploaded yet: bun run audio:upload, where the recordings are", "audio");
    }

    const local = sourcePath(ROOT, id, rid);
    if (!existsSync(local)) warn(file, `audio not found at ${rel(local)}; duration not verified`, "audio");
    else {
      const d = audioDuration(local);
      if (d === null) warn(file, "couldn't read the audio duration (is ffprobe installed?)", "duration");
      else if (Math.abs(d - r.duration) > 0.05) error(file, `duration is ${r.duration} but the audio is ${d.toFixed(2)} s`, "duration");
      if (key?.hash && hashOf(readFileSync(local)) !== key.hash) {
        error(file, `${rel(local)} isn't the uploaded recording ${r.audio}; upload the new one with bun run audio:upload`, "audio");
      }
    }

    const heard = new Map<string, number>();
    r.timeline.forEach(([addr, start, end], i) => {
      const at = `timeline.${i}`;
      const a = parseLineAddress(addr)!;
      if (!byN.has(a.n)) error(file, `bayt ${a.n} is not in poem.json`, at);
      if (end <= start) error(file, `ends (${end}) before it starts (${start})`, at);
      if (end > r.duration + 0.01) error(file, `ends at ${end}, after the audio ends (${r.duration})`, at);
      const prev = r.timeline[i - 1];
      if (prev && start < prev[2] - 0.001)
        error(file, `starts at ${start}, before ${prev[0]} ends (${prev[2]}); entries must follow the audio and not overlap`, at);
      if (prev && start - prev[2] > 6) warn(file, `${(start - prev[2]).toFixed(1)} s gap after ${prev[0]}; is a line missing?`, at);
      const len = end - start;
      if (len < 0.6) warn(file, `${addr} lasts only ${len.toFixed(2)} s`, at);
      if (len > 30) warn(file, `${addr} lasts ${len.toFixed(1)} s`, at);
      const halves = a.half ? [`${a.n}.${a.half}`] : [`${a.n}.1`, `${a.n}.2`];
      for (const h of halves) heard.set(h, (heard.get(h) ?? 0) + 1);
    });

    const all = poem.abyat.flatMap((b) => [`${b.n}.1`, `${b.n}.2`]);
    const missing = all.filter((h) => !heard.has(h));
    const repeated = [...heard].filter(([, c]) => c > 1).map(([h]) => h);
    const first = r.timeline[0]!,
      last = r.timeline.at(-1)!;
    cov.push(
      `  recitation ${rid}  ·  ${r.duration.toFixed(1)} s  ·  ${all.length - missing.length}/${all.length} halves timed` +
        `  ·  lines ${first[1].toFixed(1)}–${last[2].toFixed(1)} s` +
        (missing.length ? `  ·  not recited: ${missing.join(", ")}` : "") +
        (repeated.length ? `  ·  repeated: ${repeated.join(", ")}` : ""),
    );
  }
  return { lines: cov };
}

// ----- run -------------------------------------------------------------------

const only = process.argv[2];
const themesFile = join(CONTENT, "themes.json");
const themes = load(themesFile, source.Themes);
for (const [theme, { example }] of Object.entries(themes ?? {})) {
  if (example && !existsSync(join(CONTENT, "poems", example.poem, "poem.json")))
    error(themesFile, `unknown example poem "${example.poem}"`, theme);
}
const poets = checkPeople("poets", "poet.json", Poet);
const reciters = checkPeople("reciters", "reciter.json", Reciter);
const poemIds = dirs(join(CONTENT, "poems")).filter((p) => !only || p === only);
if (only && poemIds.length === 0) {
  console.error(`no poem "${only}" in content/poems`);
  process.exit(1);
}

const report: string[] = [];
for (const id of poemIds) {
  const c = checkPoem(id, poets, reciters);
  if (c) report.push(c.lines.join("\n"));
}

const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");
const fmt = (i: Issue) => `  ${i.file}${i.where ? ` [${i.where}]` : ""}: ${i.msg}`;

console.log(report.join("\n\n"));
console.log();
if (errors.length) console.log(`${errors.length} error${errors.length > 1 ? "s" : ""}\n${errors.map(fmt).join("\n")}\n`);
if (warnings.length) console.log(`${warnings.length} warning${warnings.length > 1 ? "s" : ""}\n${warnings.map(fmt).join("\n")}\n`);
console.log(
  errors.length
    ? "FAILED"
    : `OK  ${poemIds.length} poem${poemIds.length === 1 ? "" : "s"}, ${poets.size} poet${poets.size === 1 ? "" : "s"}, ${reciters.size} reciter${reciters.size === 1 ? "" : "s"}`,
);
process.exit(errors.length ? 1 : 0);
