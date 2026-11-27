// Draws the QR codes the app page (shawared.com/app) shows on wide windows, for the reader at
// a computer to scan with their phone: each leads to that page in its language, which sends
// the phone on to its store. Dark modules on the day paper, inside the quiet zone scanners
// need, so they read the same in the night theme. Run it after changing the page's address
// or the day palette, and commit what it writes.
//
//   bun scripts/store-qr.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { palettes } from "@shawared/design";
import qrcode from "qrcode-generator";
import { SITE } from "@shawared/contracts";
import { root } from "./repository.ts";

/** The modules of white around a code that the standard asks for. */
const QUIET = 4;

/** Each language's code, by file name, and the address it holds. */
export const CODES: Record<string, string> = {
  "qr-ar.svg": `${SITE}/app`,
  "qr-en.svg": `${SITE}/en/app`,
};

export const DIR = "apps/app/assets/stores";

/** A QR code of `text` as an SVG, one unit a module, its dark modules drawn as runs along each row. */
export function drawQr(text: string): string {
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  const side = n + 2 * QUIET;
  const runs: string[] = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n;) {
      if (!qr.isDark(row, col)) {
        col++;
        continue;
      }
      let end = col;
      while (end < n && qr.isDark(row, end)) end++;
      runs.push(`M${col + QUIET} ${row + QUIET}h${end - col}v1h${col - end}z`);
      col = end;
    }
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" shape-rendering="crispEdges">`,
    `<rect width="${side}" height="${side}" fill="${palettes.day.bg}"/>`,
    `<path fill="${palettes.day.fg}" d="${runs.join("")}"/>`,
    `</svg>`,
    ``,
  ].join("\n");
}

if (import.meta.main) {
  const out = join(root(), DIR);
  mkdirSync(out, { recursive: true });
  for (const [name, text] of Object.entries(CODES)) writeFileSync(join(out, name), drawQr(text));
  console.log(`${Object.keys(CODES).join(", ")} in ${out}`);
}
