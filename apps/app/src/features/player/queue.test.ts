import type { Catalog } from "@shawared/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalogEntry } from "./item";

let byline: typeof import("./queue").byline;
let queueFor: typeof import("./queue").queueFor;
let rememberList: typeof import("./queue").rememberList;

const poem = (id: string, poet: string, uploaded = true) =>
  ({
    id,
    title: `title ${id}`,
    poet,
    abyat: 3,
    recitations: [{ id: "r", reciter: "osama", duration: 40, ...(uploaded ? { audio: `${id}/r.m4a` } : {}) }],
  }) as Catalog["poems"][number];

// The home page's order: newest first.
const catalog = {
  schema: 1,
  poems: [poem("a", "p1"), poem("b", "p2"), poem("c", "p1"), poem("d", "p2"), poem("old", "p1", false)],
  poets: {
    p1: { id: "p1", name: "المتنبي", names: { en: "al-Mutanabbi" }, poems: 3 },
    p2: { id: "p2", name: "جرير", names: {}, poems: 2 },
  },
  reciters: { osama: { id: "osama", name: "أسامة الواعظ", names: { en: "Osama Alwaaedh" }, poems: 5 } },
  meters: {},
} as Catalog;

beforeEach(async () => {
  vi.resetModules();
  ({ byline, queueFor, rememberList } = await import("./queue"));
});

describe("the queue", () => {
  it("is the home page's order for a poem opened from anywhere else", () => {
    expect(queueFor("b", catalog)).toEqual(["a", "b", "c", "d"]);
  });

  it("is the list the poem was opened from, as it showed them", () => {
    rememberList("c", ["c", "a"]);
    expect(queueFor("c", catalog)).toEqual(["c", "a"]);
    // Search results on the home page are a list too.
    rememberList("d", ["d", "b"]);
    expect(queueFor("d", catalog)).toEqual(["d", "b"]);
    // Another poem keeps its own.
    expect(queueFor("b", catalog)).toEqual(["a", "b", "c", "d"]);
  });

  it("leaves out poems whose recording the catalog doesn't name (an older copy of it)", () => {
    rememberList("a", ["old", "a", "c"]);
    expect(queueFor("a", catalog)).toEqual(["a", "c"]);
  });

  it("is the poem alone before the catalog is here", () => {
    expect(queueFor("b", undefined)).toEqual(["b"]);
    rememberList("c", ["a", "c"]);
    expect(queueFor("c", undefined)).toEqual(["c"]);
  });

  it("names the poems it queues from the catalog, in the reader's language", () => {
    expect(catalogEntry(catalog, "c", "en")).toMatchObject({
      poemId: "c",
      title: "title c",
      poet: "al-Mutanabbi",
      reciter: "Osama Alwaaedh",
      recitation: { id: "r", audio: "c/r.m4a", duration: 40, timeline: [] },
    });
    expect(catalogEntry(catalog, "old", "ar")).toBeNull();
    expect(byline("المتنبي", "أسامة الواعظ", "ar")).toBe("المتنبي · إلقاء أسامة الواعظ");
    expect(byline("al-Mutanabbi", "Osama Alwaaedh", "en")).toBe("al-Mutanabbi · Recited by Osama Alwaaedh");
  });
});
