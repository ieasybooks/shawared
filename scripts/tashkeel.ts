// Puts a poem's harakat in the house style (packages/contracts/src/tashkeel.ts): the verses
// in poem.json and the Arabic each word note repeats, so the notes still match.
//
//   bun scripts/tashkeel.ts <poem-id>         show what would change, and what needs a person
//   bun scripts/tashkeel.ts <poem-id> --fix   write the changes
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { houseStyle, tashkeelIssues } from "@shawared/contracts";
import { languageFiles, root } from "./repository.ts";

const [id, flag] = process.argv.slice(2);
if (!id) {
  console.error("usage: bun scripts/tashkeel.ts <poem-id> [--fix]");
  process.exit(1);
}
const fix = flag === "--fix";
const dir = join(root(), "content", "poems", id);
let changes = 0;

const pf = join(dir, "poem.json");
let poemText = readFileSync(pf, "utf8");
const poem = JSON.parse(poemText);
for (const b of poem.abyat) {
  for (const key of ["sadr", "ajuz"] as const) {
    const was: string = b[key];
    const now = houseStyle(was);
    if (now !== was) {
      changes++;
      console.log(`${b.n}.${key === "sadr" ? 1 : 2}  ${was}\n     ${now}`);
      poemText = poemText.replace(JSON.stringify(was), JSON.stringify(now));
    }
    for (const m of tashkeelIssues(now)) console.log(`${b.n}.${key === "sadr" ? 1 : 2}  needs a look: ${m}`);
  }
}
if (fix) writeFileSync(pf, poemText);

// Edit in place so the files keep their hand-made layout.
for (const f of languageFiles(dir)) {
  const file = join(dir, f);
  let text = readFileSync(file, "utf8");
  const data = JSON.parse(text);
  for (const note of Object.values<{ word: string; head?: string }>(data.words ?? {})) {
    for (const v of [note.word, note.head]) {
      if (!v || houseStyle(v) === v) continue;
      changes++;
      console.log(`${f}  ${v} → ${houseStyle(v)}`);
      text = text.replaceAll(`"${v}"`, `"${houseStyle(v)}"`);
    }
  }
  if (fix) writeFileSync(file, text);
}
console.log(
  changes
    ? `${changes} change${changes > 1 ? "s" : ""}${fix ? " written" : "; run again with --fix to write them"}`
    : "already in the house style",
);
