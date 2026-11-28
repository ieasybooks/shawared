import { waitForApp } from "./app-ready";
import { expect, test } from "@playwright/test";

for (const lang of ["ar", "en"] as const) {
  const prefix = lang === "ar" ? "" : "/en";

  test(`${lang}: directory controls keep their touch targets without stacking a gap above results`, async ({ page }) => {
    for (const directory of ["poets", "reciters", "meters", "rhymes", "themes"]) {
      await page.goto(`${prefix}/${directory}`);
      await waitForApp(page);
      const first = page.locator(`a[href^="${prefix}/${directory}/"]`).first();
      const sort = page.getByTestId("list-header").getByRole("button", { expanded: false }).last();
      await expect(first).toBeVisible();
      const control = (await sort.boundingBox())!;
      expect(control.height, directory).toBeGreaterThanOrEqual(44);
      expect((await first.boundingBox())!.y - control.y - control.height, directory).toBeCloseTo(directory === "themes" ? 1 : 0, 0);
      if (directory !== "themes") {
        await expect(first).toHaveCSS("border-top-width", "0px");
        await expect(first).toHaveCSS("padding-top", "0px");
        await expect(page.locator(`a[href^="${prefix}/${directory}/"]`).nth(1)).toHaveCSS("border-top-width", "1px");
      }
      if (directory === "poets" || directory === "reciters") {
        await page.getByRole("textbox").fill(directory === "poets" ? "المتنبي" : "الواعظ");
        await expect(first).toHaveCSS("padding-top", "0px");
        expect((await first.boundingBox())!.y - control.y - control.height).toBeCloseTo(0, 0);
      }
    }
  });

  test(`${lang}: first poem rows have no rule and lists end with a single footer gap`, async ({ page }) => {
    for (const path of ["/poets/jamil-buthayna", "/reciters/abd-al-rahman-al-humayn", "/meters/mutaqarib", "/rhymes/ra", "/themes/ritha"]) {
      await page.goto(prefix + path);
      await waitForApp(page);
      // A theme's quotation is a separate card, with a bayt in its address.
      const rows = page.locator(`a[href^="${prefix}/poems/"]:not([href*="?"])`);
      await expect(rows.first()).toHaveCSS("border-top-width", "0px");
      await expect(rows.first()).toHaveCSS("padding-top", "0px");
      if ((await rows.count()) > 1) await expect(rows.nth(1)).toHaveCSS("border-top-width", "1px");
      const footer = page.getByTestId("list-footer");
      await footer.scrollIntoViewIfNeeded();
      await expect
        .poll(async () => {
          const last = await rows.last().boundingBox();
          const end = await footer.boundingBox();
          return last && end ? Math.round(end.y - last.y - last.height) : -1;
        })
        .toBe(0);
      await expect(rows.last()).toHaveCSS("padding-bottom", "0px");
      expect((await footer.boundingBox())!.height).toBe(24);
    }
  });

  test(`${lang}: the home list keeps its compact search opening and a consistent end`, async ({ page }) => {
    await page.goto(prefix || "/");
    await waitForApp(page);
    const rows = page.locator(`a[href^="${prefix}/poems/"]`);
    await expect(rows.first().locator("..")).toHaveCSS("border-top-width", "0px");
    await expect(rows.nth(1).locator("..")).toHaveCSS("border-top-width", "1px");
    await page.getByRole("textbox").fill("تقول بثينة");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveCSS("padding-top", "0px");
    await expect(rows.first()).toHaveCSS("padding-bottom", "0px");
    const field = (await page.getByRole("textbox").locator("..").boundingBox())!;
    expect((await rows.first().boundingBox())!.y - field.y - field.height).toBe(12);
    await expect(page.getByTestId("list-header").locator('[aria-live="polite"]')).toHaveText(lang === "ar" ? "قصيدة واحدة" : "1 poem");
    const footer = (await page.getByTestId("list-footer").boundingBox())!;
    const last = (await rows.last().boundingBox())!;
    expect(footer.y - last.y - last.height).toBeCloseTo(0, 0);
    expect(footer.height).toBe(24);
  });

  test(`${lang}: secondary subjects are a sentence in the introduction`, async ({ page }) => {
    await page.goto(`${prefix}/poems/taqulu-buthaynatu`);
    await page.getByRole("button", { name: lang === "ar" ? "عن القصيدة" : "About the poem", exact: true }).click();
    const sentence = lang === "ar" ? "ومن موضوعاتها أيضًا العتاب." : "The poem also touches on reproach.";
    await expect(page.getByText(sentence, { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(page.getByText(lang === "ar" ? "موضوعات أخرى" : "Other subjects", { exact: true })).toHaveCount(0);
  });
}
