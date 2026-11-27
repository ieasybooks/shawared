// Fills in the Arabic each word note repeats ("word": "") from its address, then lists
// every note with the words it points at, so a wrong address shows before it ships.
//
//   bun scripts/notes.ts <poem-id>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseWordAddress, wordsOf } from "@shawared/contracts";
import { languageFiles, root } from "./repository.ts";

const id = process.argv[2];
if (!id) {
  console.error("usage: bun scripts/notes.ts <poem-id>");
  process.exit(1);
}
const dir = join(root(), "content", "poems", id);
const poem = JSON.parse(readFileSync(join(dir, "poem.json"), "utf8"));
const half = (n: number, h: 1 | 2) => {
  const b = poem.abyat.find((x: { n: number }) => x.n === n);
  return b ? (h === 1 ? b.sadr : b.ajuz) : undefined;
};

for (const f of languageFiles(dir)) {
  const file = join(dir, f);
  let text = readFileSync(file, "utf8");
  const data = JSON.parse(text);
  console.log(`\n${f}`);
  for (const [addr, note] of Object.entries<{ word: string; head?: string }>(data.words ?? {})) {
    const a = parseWordAddress(addr);
    const t = a && half(a.n, a.half);
    if (!a || !t) {
      console.log(`  ${addr}  no such half`);
      continue;
    }
    const actual = wordsOf(t)
      .slice(a.from - 1, a.to)
      .join(" ");
    if (!note.word) {
      text = text.replace(new RegExp(`("${addr.replace(/\./g, "\\.")}"\\s*:\\s*\\{\\s*"word"\\s*:\\s*)""`), `$1"${actual}"`);
      note.word = actual;
    }
    const flag = note.word.normalize("NFC") === actual.normalize("NFC") ? "" : `   ≠ text «${actual}»`;
    console.log(`  ${addr.padEnd(9)} ${note.word}${note.head ? `  (${note.head})` : ""}${flag}`);
  }
  writeFileSync(file, text);
}
