import { describe, expect, it } from "vitest";
import { tabOf } from "./tabs";

describe("current navigation section", () => {
  it("recognizes a section's index and detail pages in either language", () => {
    expect(tabOf("/")).toBe("index");
    expect(tabOf("/en")).toBe("index");
    expect(tabOf("/poets")).toBe("poets");
    expect(tabOf("/en/poets/jamil")).toBe("poets");
    expect(tabOf("/en/meters/tawil")).toBe("meters");
    expect(tabOf("/rhymes/hamza")).toBe("rhymes");
  });

  it("does not mark unrelated routes or a poem as a directory", () => {
    for (const path of ["/poets-extra", "/enough/poets", "/about", "/playlist", "/en/poems/taqulu"]) expect(tabOf(path), path).toBe("");
  });
});
