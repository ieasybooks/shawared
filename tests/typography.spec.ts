// Every text box is trimmed to its ink (packages/design/src/type.ts), so two visible texts
// must never overlap. This walks every screen and state and checks that, in both languages.
import { expect, test, type Page } from "@playwright/test";

type Box = { text: string; top: number; bottom: number; left: number; right: number };

/** Ink boxes of every visible, uncovered text on the page. */
async function inkBoxes(page: Page): Promise<Box[]> {
  return page.evaluate(() => {
    const isText = (el: Element | null) => el?.getAttribute("dir") === "auto";
    const out: { text: string; top: number; bottom: number; left: number; right: number }[] = [];
    for (const el of Array.from(document.querySelectorAll("div, span"))) {
      if (!isText(el) || (el.parentElement && isText(el.parentElement))) continue;
      const text = (el.textContent ?? "").trim();
      if (!text) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      let hidden = false;
      for (let a: Element | null = el; a; a = a.parentElement) if (Number(getComputedStyle(a).opacity) < 0.05) hidden = true;
      if (hidden) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const mt = parseFloat(cs.marginTop);
      const mb = parseFloat(cs.marginBottom);
      const box = {
        text: text.slice(0, 40),
        top: r.top + Math.max(0, -mt),
        bottom: r.bottom - Math.max(0, -mb),
        left: r.left,
        right: r.right,
      };
      // Only the part a scrolling or clipping container lets through is on screen.
      for (let a = el.parentElement; a; a = a.parentElement) {
        const o = getComputedStyle(a);
        if (!/(auto|scroll|hidden)/.test(o.overflowX + o.overflowY)) continue;
        const c = a.getBoundingClientRect();
        box.top = Math.max(box.top, c.top);
        box.bottom = Math.min(box.bottom, c.bottom);
        box.left = Math.max(box.left, c.left);
        box.right = Math.min(box.right, c.right);
      }
      if (box.bottom - box.top < 1 || box.right - box.left < 1) continue;
      // Skip text that is scrolled away or covered (a sheet over the verses, say).
      const x = (box.left + box.right) / 2;
      const y = (box.top + box.bottom) / 2;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
      const hit = document.elementFromPoint(x, y);
      if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) continue;
      out.push(box);
    }
    return out;
  });
}

async function expectNoOverlap(page: Page, state: string, atLeast = 4) {
  await page.waitForTimeout(450);
  await expect
    .poll(async () => (await inkBoxes(page)).length, { message: `${state}: texts found`, timeout: 15_000 })
    .toBeGreaterThanOrEqual(atLeast);
  const boxes = await inkBoxes(page);
  const clashes: string[] = [];
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!;
      const b = boxes[j]!;
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 0.5 && h > 0.5) clashes.push(`«${a.text}» × «${b.text}» (${h.toFixed(1)} px)`);
    }
  expect(clashes, `${state}: overlapping texts`).toEqual([]);
}

const POEM = "/poems/taqulu-buthaynatu";
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 960;

/** A page in a language: English lives under /en. */
const at = (lang: "ar" | "en", path: string) => (lang === "ar" ? path : path === "/" ? "/en" : `/en${path}`);

/** A reader's library with something in every part: what lib/saved.ts keeps in the browser. */
const SAVED = {
  poems: ["taqulu-buthaynatu"],
  poets: ["jamil-buthayna"],
  reciters: ["osama-alwaaedh"],
  playlists: [{ id: "t1", name: "قصائد الحب والفراق في المساء الطويل", poems: ["taqulu-buthaynatu"] }],
};

for (const lang of ["ar", "en"] as const) {
  test.describe(`no overlapping text (${lang})`, () => {
    test("home", async ({ page }) => {
      await page.goto(at(lang, "/"));
      await expectNoOverlap(page, "home");
      await page.getByRole("textbox").fill(lang === "ar" ? "بثينه" : "Jamil");
      await expectNoOverlap(page, "home, searching");
      await page.getByRole("textbox").fill("zzzz");
      await expectNoOverlap(page, "home, nothing found", 2);
      await page.getByRole("textbox").fill("");
      await page
        .getByRole("button", { name: lang === "ar" ? "اللغة" : "Language" })
        .first()
        .click();
      // The menu's backdrop covers the page, so only its two items are visible.
      await expectNoOverlap(page, "home, language menu", 2);
    });

    test("poem page", async ({ page }) => {
      await page.goto(at(lang, POEM));
      await expectNoOverlap(page, "poem");
      await page.getByRole("button", { name: lang === "ar" ? "شغّل من البيت ٥" : "Play from verse 5" }).click();
      await page.waitForTimeout(1200);
      await expectNoOverlap(page, "playing bayt 5");
      await page
        .getByRole("button", { name: lang === "ar" ? "إيقاف مؤقت" : "Pause" })
        .first()
        .click();
    });

    test("explanation, a word's meaning and the introduction", async ({ page }) => {
      await page.goto(at(lang, POEM));
      await expectNoOverlap(page, "the introduction, on opening");
      await page.getByRole("button", { name: lang === "ar" ? "شغّل من البيت ٢" : "Play from verse 2" }).click();
      await page.getByText(/^كَجَنـ*احِ$/).click();
      await expectNoOverlap(page, "explanation held on bayt 7");
      if (isPhone(page)) await page.getByRole("button", { name: lang === "ar" ? "أغلق الشرح" : "Close the explanation" }).click();
      await page.getByRole("button", { name: "أَجُرُّ" }).first().click();
      await page.waitForTimeout(500);
      await expectNoOverlap(page, "a word's meaning brought forward");
      if (isPhone(page)) await page.getByRole("button", { name: lang === "ar" ? "أغلق الشرح" : "Close the explanation" }).click();
      await page.getByRole("button", { name: lang === "ar" ? "عن القصيدة" : "About the poem" }).click();
      await expectNoOverlap(page, "the introduction, from its chip");
    });

    for (const path of [
      "/poets",
      "/poets/jamil-buthayna",
      "/reciters",
      "/reciters/osama-alwaaedh",
      "/meters",
      "/themes",
      "/themes/ritha",
      "/meters/mutaqarib",
      "/meters/kamil",
      "/library",
      "/about",
      "/privacy",
      "/terms",
      "/support",
    ])
      test(path, async ({ page }) => {
        await page.goto(at(lang, path));
        await expectNoOverlap(page, path, 3);
      });

    test("/app", async ({ page }) => {
      await page.goto(at(lang, "/app"));
      // The badges are pictures: phones have the lead, wide windows the QR code's line too.
      await expectNoOverlap(page, "/app", isPhone(page) ? 1 : 3);
    });

    test("the library and a playlist, with what a reader keeps", async ({ page }) => {
      await page.addInitScript((saved) => localStorage.setItem("shawared.saved.v1", saved), JSON.stringify(SAVED));
      await page.goto(at(lang, "/library"));
      await expect(page.getByText(lang === "ar" ? "القصائد المفضّلة" : "Favorite poems").first()).toBeVisible();
      await expectNoOverlap(page, "/library", 3);
      await page.goto(at(lang, "/playlist?id=t1"));
      await expect(page.getByText(lang === "ar" ? "شغّل الكل" : "Play all").first()).toBeVisible();
      await expectNoOverlap(page, "a playlist", 3);
    });

    test("mini player", async ({ page }) => {
      await page.goto(at(lang, POEM));
      await page.getByRole("button", { name: lang === "ar" ? "تشغيل" : "Play", exact: true }).click();
      const poets = lang === "ar" ? "الشعراء" : "Poets";
      await page
        .getByRole("tab", { name: poets })
        .or(page.getByRole("navigation").getByRole("link", { name: poets }))
        .or(page.getByRole("button", { name: lang === "ar" ? "رجوع" : "Back" }))
        .first()
        .click();
      await expect(page.getByRole("link", { name: "تَقولُ بُثَينَةُ لَمّا رَأَت", exact: true })).toBeVisible();
      await expectNoOverlap(page, "mini player");
    });
  });
}
