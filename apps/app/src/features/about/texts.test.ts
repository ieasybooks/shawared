import { describe, expect, it } from "vitest";
import { ABOUT, CONTACT, PRIVACY, runs, SUPPORT, TERMS, type PageText } from "./texts";

const PAGES = { ABOUT, PRIVACY, TERMS, SUPPORT };
/** The pages a paragraph may link to (app/<page>.tsx and app/en/<page>.tsx). */
const ROUTES = ["/about", "/privacy", "/terms", "/support"];
const paragraphs = (p: PageText) => [p.lead, ...p.sections.flatMap((s) => s.body)];

describe("runs", () => {
  it("cuts a paragraph into text and links", () => {
    expect(runs("Write to [us](mailto:a@b.c), or see [the terms](/terms).")).toEqual([
      { text: "Write to " },
      { text: "us", href: "mailto:a@b.c" },
      { text: ", or see " },
      { text: "the terms", href: "/terms" },
      { text: "." },
    ]);
    expect(runs("No links.")).toEqual([{ text: "No links." }]);
  });
});

describe("the pages' links", () => {
  for (const [name, page] of Object.entries(PAGES)) {
    it(`${name}: lead to a page there is, our address or a web address, the same in both languages`, () => {
      const links = (p: PageText) => paragraphs(p).map((t) => runs(t).flatMap((r) => (r.href ? [r.href] : [])));
      for (const lang of ["ar", "en"] as const) {
        for (const text of paragraphs(page[lang])) {
          // What isn't a link reads as plain text: no brackets left over.
          for (const r of runs(text)) if (!r.href) expect(r.text, text).not.toMatch(/\]\(/);
          for (const { href } of runs(text).filter((r) => r.href)) {
            if (href!.startsWith("/")) expect(ROUTES).toContain(href);
            else if (href!.startsWith("mailto:")) expect(href).toBe(`mailto:${CONTACT}`);
            else expect(href).toMatch(/^https:\/\//);
          }
        }
      }
      expect(page.ar.sections.length).toBe(page.en.sections.length);
      expect(links(page.ar)).toEqual(links(page.en));
    });
  }
});
