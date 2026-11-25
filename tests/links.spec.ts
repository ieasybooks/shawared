// A link that is a line of text takes that text's width, never its container's. Rows and
// cards (several texts, tapped anywhere) are links of their own and aren't checked here.
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/poets",
  "/poets/jamil-buthayna",
  "/reciters/osama-alwaaedh",
  "/meters",
  "/meters/mutaqarib",
  "/themes",
  "/themes/ritha",
  "/rhymes",
  "/rhymes/ra",
  "/library",
  "/poems/taqulu-buthaynatu",
  "/en/poems/taqulu-buthaynatu",
  "/en/poets/jamil-buthayna",
  "/about",
  "/en/privacy",
  "/terms",
  "/en/terms",
  "/support",
  "/a-page-that-is-not-here",
];

test("text links span only their text", async ({ page }) => {
  const wide: string[] = [];
  let checked = 0;
  for (const path of PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // The dev server loads a page's code after showing it; let the page settle first.
    await page.waitForTimeout(1200);
    const links = await page.evaluate(() =>
      [...document.querySelectorAll("a, [role='link']")]
        .filter((a) => !a.closest("[inert]") && a.getBoundingClientRect().width > 0)
        .map((a) => {
          // The texts inside, outermost only; a text link has one.
          const texts = [...a.querySelectorAll("[dir='auto']")].filter((t) => !t.parentElement?.closest("[dir='auto']"));
          // Inline icons are part of a badge's label, too.
          const runs: DOMRect[] = [...a.querySelectorAll("svg")].map((icon) => icon.getBoundingClientRect());
          const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!n.textContent?.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            runs.push(...[...range.getClientRects()].filter((r) => r.width > 0));
          }
          const text = runs.length ? Math.max(...runs.map((r) => r.right)) - Math.min(...runs.map((r) => r.left)) : 0;
          return {
            label: (a.textContent ?? "").trim(),
            texts: a.matches("[dir='auto']") ? 1 : texts.length,
            link: a.getBoundingClientRect().width,
            text,
          };
        }),
    );
    for (const l of links.filter((x) => x.texts === 1)) {
      checked++;
      // A little slack for padding around the text.
      if (l.link > l.text + 24) wide.push(`${path}: «${l.label}» is ${Math.round(l.link)} px for ${Math.round(l.text)} px of text`);
    }
  }
  // Phones have fewest: the reciter on the two poem pages and the way home from a missing page.
  expect(checked).toBeGreaterThanOrEqual(3);
  expect(wide).toEqual([]);
});
