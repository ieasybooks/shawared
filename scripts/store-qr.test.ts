import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CODES, DIR, drawQr } from "./store-qr.ts";

describe("the app page's QR codes", () => {
  it("are the ones the script draws now, for the page's address in each language", () => {
    for (const [name, text] of Object.entries(CODES)) {
      expect(readFileSync(join(import.meta.dirname, "..", DIR, name), "utf8"), `${name}: run bun scripts/store-qr.ts`).toBe(drawQr(text));
    }
  });
});
