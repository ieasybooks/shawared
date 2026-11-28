import { CatalogPoem } from "@shawared/contracts";
import { describe, expect, it } from "vitest";
import { nameOf, poemsForMeter, poemsForRhyme, poemsForTheme, poemsWithIds } from "./catalog";

const poem = (id: string, fields: Partial<CatalogPoem> = {}): CatalogPoem =>
  CatalogPoem.parse({
    id,
    title: id,
    poet: "poet",
    meter: "tawil",
    abyat: 1,
    abyat_in_full: 1,
    added: "2026-11-16",
    opening: { n: 1, sadr: "صدر", ajuz: "عجز" },
    hash: id,
    ...fields,
  });

const poems = [
  poem("newest", { theme: "ritha", rawiy: "أ" }),
  poem("older", { meter: "basit", theme: "ghazal", rawiy: "ء" }),
  poem("oldest", { theme: "ritha", rawiy: "ى" }),
  poem("legacy"),
];
const ids = (selected: CatalogPoem[]) => selected.map((entry) => entry.id);

describe("catalog selections", () => {
  it("keeps catalog order for a person's IDs, ignoring missing or repeated IDs", () => {
    expect(ids(poemsWithIds(poems, ["oldest", "missing", "newest", "newest"]))).toEqual(["newest", "oldest"]);
    expect(ids(poemsWithIds(poems, []))).toEqual([]);
  });

  it("selects a meter or primary theme without changing catalog order", () => {
    expect(ids(poemsForMeter(poems, "tawil"))).toEqual(["newest", "oldest", "legacy"]);
    expect(ids(poemsForTheme(poems, "ritha"))).toEqual(["newest", "oldest"]);
    expect(ids(poemsForTheme(poems, "missing"))).toEqual([]);
    expect(ids(poems)).toEqual(["newest", "older", "oldest", "legacy"]);
  });

  it("groups rhyme variants by the recited rhyme letter, including older poems without one", () => {
    expect(ids(poemsForRhyme(poems, "hamza"))).toEqual(["newest", "older"]);
    expect(ids(poemsForRhyme(poems, "alif"))).toEqual(["oldest"]);
    expect(ids(poemsForRhyme(poems, "ya"))).toEqual([]);
  });
});

describe("person names", () => {
  const person = { name: "جميل بثينة", names: { ar: "اسم بديل", en: "Jamil Buthayna" } };

  it("uses the Arabic name in Arabic and the translated name when present", () => {
    expect(nameOf(person, "ar")).toBe("جميل بثينة");
    expect(nameOf(person, "en")).toBe("Jamil Buthayna");
  });

  it("falls back to Arabic for an unavailable translation and handles absent people", () => {
    expect(nameOf(person, "fr")).toBe("جميل بثينة");
    expect(nameOf({ name: "جميل بثينة", names: {} }, "en")).toBe("جميل بثينة");
    expect(nameOf(undefined, "en")).toBe("");
  });
});
