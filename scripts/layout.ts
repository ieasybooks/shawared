// Rewrites a poem's language files (ar.json, en.json, …) in the house layout: one bayt per
// line (a translation and its sharh on two), one word note per line, keys padded so the
// values line up. Use it after editing the files with a script; JSON.stringify's layout
// spreads every note over six lines.
//
//   bun scripts/layout.ts <poem-id>
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const id = process.argv[2];
if (!id) {
  console.error("usage: bun scripts/layout.ts <poem-id>");
  process.exit(1);
}
const dir = join(import.meta.dir, "..", "content", "poems", id);
const j = (v: unknown) => JSON.stringify(v);
// JSON with a space after each comma in arrays, as written by hand.
const jv = (v: unknown): string => (Array.isArray(v) ? `[${v.map(jv).join(", ")}]` : j(v));
const inline = (o: Record<string, unknown>) =>
  `{ ${Object.entries(o)
    .map(([k, v]) => `${j(k)}: ${jv(v)}`)
    .join(", ")} }`;

function block(entries: [string, string][], indent = "    ") {
  const width = Math.max(...entries.map(([k]) => j(k).length + 1));
  return entries.map(([k, v], i) => `${indent}${`${j(k)}:`.padEnd(width)} ${v}${i < entries.length - 1 ? "," : ""}`).join("\n");
}

for (const f of readdirSync(dir).filter((f) => /^[a-z]{2}(\.[a-z0-9-]+)?\.json$/.test(f))) {
  const data = JSON.parse(readFileSync(join(dir, f), "utf8"));
  const out: string[] = [];
  for (const [key, value] of Object.entries<any>(data)) {
    if (key === "abyat") {
      const entries = Object.entries<any>(value);
      const width = Math.max(...entries.map(([k]) => j(k).length + 1));
      const rows = entries.map(([k, v], i) => {
        const lead = `    ${`${j(k)}:`.padEnd(width)} `;
        const comma = i < entries.length - 1 ? "," : "";
        const { translation, ...rest } = v;
        if (!translation) return `${lead}${inline(v)}${comma}`;
        const tail = Object.entries(rest).map(([rk, rv]) => `${j(rk)}: ${jv(rv)}`);
        if (!tail.length) return `${lead}{ "translation": ${jv(translation)} }${comma}`;
        return `${lead}{ "translation": ${jv(translation)},\n${" ".repeat(lead.length + 2)}${tail.join(", ")} }${comma}`;
      });
      out.push(`  "abyat": {\n${rows.join("\n")}\n  }`);
    } else if (key === "words") {
      const entries = Object.entries<any>(value).map(([k, v]) => [k, inline(v)] as [string, string]);
      out.push(entries.length ? `  "words": {\n${block(entries)}\n  }` : `  "words": {}`);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(`  ${j(key)}: ${inline(value)}`);
    } else {
      out.push(`  ${j(key)}: ${j(value)}`);
    }
  }
  writeFileSync(join(dir, f), `{\n${out.join(",\n")}\n}\n`);
  console.log(`laid out ${f}`);
}
