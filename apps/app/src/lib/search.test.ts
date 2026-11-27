import type { Catalog, CatalogPoem } from "@shawared/contracts";
import { describe, expect, it } from "vitest";
import { fold, indexCatalog, search, searchPeople } from "./search";

const poem = (id: string, title: string, sadr: string, poet: string, en?: string): CatalogPoem => ({
  id,
  title,
  titles: en ? { en } : {},
  poet,
  meter: "mutaqarib",
  abyat: 10,
  abyat_in_full: 10,
  added: "2026-11-16",
  opening: { n: 1, sadr, ajuz: "فُنوناً مِنَ الشَّعَرِ الأَحمَرِ" },
  langs: [],
  recitations: [{ id: "r", reciter: "osama", duration: 60 }],
  hash: "x",
  kashida: {},
});

const catalog: Catalog = {
  schema: 1,
  poems: [
    poem("a", "تَقولُ بُثَينَةُ لَمّا رَأَت", "تَقولُ بُثَينَةُ لَمّا رَأَت", "jamil", "Buthayna Said, When She Saw"),
    poem("b", "واحَرَّ قَلباهُ", "واحَرَّ قَلباهُ مِمَّن قَلبُهُ شَبِمُ", "mutanabbi"),
  ],
  poets: {
    jamil: { id: "jamil", name: "جَميل بُثَينة", names: { en: "Jamil Buthayna" }, poems: 1 },
    mutanabbi: { id: "mutanabbi", name: "المُتَنَبّي", names: { en: "al-Mutanabbī" }, poems: 1 },
  },
  reciters: { osama: { id: "osama", name: "أسامة الواعظ", names: { en: "Osama Al-Waaedh" }, poems: 2 } },
  meters: { mutaqarib: 1, basit: 1 },
};
const index = indexCatalog(catalog);
const ids = (q: string) => search(index, q).map((p) => p.id);

describe("fold", () => {
  it("drops harakat and unifies letters", () => {
    expect(fold("تَقولُ بُثَينَةُ")).toBe("تقول بثينه");
    expect(fold("أَودى")).toBe("اودي");
    expect(fold("al-Mutaqārib")).toBe("al mutaqarib");
  });
});

describe("search", () => {
  it("finds a title without harakat", () => expect(ids("تقول بثينة")).toEqual(["a"]));
  it("finds by the first bayt", () => expect(ids("شبم")).toEqual(["b"]));
  it("finds by poet in either language", () => {
    expect(ids("المتنبي")).toEqual(["b"]);
    expect(ids("mutanabbi")).toEqual(["b"]);
  });
  it("finds by reciter", () => expect(ids("الواعظ")).toEqual(["a", "b"]));
  it("finds by the English title", () => expect(ids("buthayna said")).toEqual(["a"]));
  it("ranks title matches ahead of opening matches and preserves catalog order within each rank", () => {
    const competing = indexCatalog({
      ...catalog,
      poems: [
        poem("opening-a", "شَوقٌ", "بُثَينَةُ", "mutanabbi"),
        poem("title-a", "بُثَينَةُ", "شَوقٌ", "mutanabbi"),
        poem("opening-b", "لَيلٌ", "بُثَينَةُ", "mutanabbi"),
        poem("title-b", "ذِكرُ بُثَينَةَ", "لَيلٌ", "mutanabbi"),
      ],
    });
    expect(search(competing, "بثينة").map((p) => p.id)).toEqual(["title-a", "title-b", "opening-a", "opening-b"]);
  });
  it("returns everything for an empty query", () => expect(ids("  ")).toEqual(["a", "b"]));
  it("needs every word to match", () => expect(ids("المتنبي بثينة")).toEqual([]));
});

describe("searchPeople", () => {
  const people = Object.values(catalog.poets);
  it("finds a person by any of their names, without harakat", () => {
    expect(searchPeople(people, "جميل").map((p) => p.id)).toEqual(["jamil"]);
    expect(searchPeople(people, "mutanabbi").map((p) => p.id)).toEqual(["mutanabbi"]);
    expect(searchPeople(people, "المتنبي").map((p) => p.id)).toEqual(["mutanabbi"]);
  });
  it("keeps everyone for an empty query and no one for a stranger", () => {
    expect(searchPeople(people, "  ")).toHaveLength(2);
    expect(searchPeople(people, "شوقي")).toEqual([]);
  });
});
