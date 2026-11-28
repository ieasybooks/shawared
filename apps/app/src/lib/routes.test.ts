import { describe, expect, it } from "vitest";
import { contentPage, langOfPath, pathInLang, paths } from "./routes";

describe("page addresses", () => {
  it("keeps the English root and language prefix distinct from other route names", () => {
    expect(langOfPath("/en")).toBe("en");
    expect(langOfPath("/en/poets/jamil")).toBe("en");
    expect(langOfPath("/enough")).toBe("ar");
    expect(pathInLang("/", "en")).toBe("/en");
    expect(pathInLang("/en", "ar")).toBe("/");
    expect(pathInLang("/en/poets/jamil", "en")).toBe("/en/poets/jamil");
  });

  it("changes language without losing a bayt, playlist id, or fragment", () => {
    expect(pathInLang(`${paths.poem("taqulu", 7)}#verse`, "en")).toBe("/en/poems/taqulu?b=7#verse");
    expect(pathInLang("/en/poems/taqulu?b=7#verse", "ar")).toBe("/poems/taqulu?b=7#verse");
    expect(pathInLang(paths.playlist("one/two & three"), "en")).toBe("/en/playlist?id=one%2Ftwo%20%26%20three");
  });
});

describe("content pages", () => {
  it("finds the file target for localized poem and person links without query data", () => {
    expect(contentPage("/en/poems/taqulu?b=7")).toEqual({ kind: "poems", id: "taqulu" });
    expect(contentPage("/poets/jamil#bio")).toEqual({ kind: "poets", id: "jamil" });
    expect(contentPage("/en/reciters/osama")).toEqual({ kind: "reciters", id: "osama" });
  });

  it("does not load files for directories, local pages, or outside links", () => {
    for (const href of ["/en/poets", "/poems/", "/meters/tawil", "/en/themes/ritha", "/playlist?id=a", "https://shawared.com/poems/a"])
      expect(contentPage(href), href).toBeUndefined();
  });
});
