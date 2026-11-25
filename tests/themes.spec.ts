import { expect, test } from "@playwright/test";
import type { Catalog, PoemBundle } from "@shawared/contracts";

test("the theme index searches both languages, sorts, and opens the quoted verse", async ({ page, request }, info) => {
  const catalog: Catalog = await (await request.get("/content/v1/catalog.json")).json();
  const entries = Object.entries(catalog.themes!);
  const elegy = catalog.themes!.ritha!;
  const byCount = [...entries].sort(([, a], [, b]) => b.poems - a.poems || a.name.en.localeCompare(b.name.en, "en"));
  const byName = [...entries].sort(([, a], [, b]) => a.name.en.localeCompare(b.name.en, "en"));

  await page.goto("/en/themes");
  await page.waitForLoadState("networkidle");
  if (info.project.name === "phone") {
    await expect(page.getByRole("tab")).toHaveCount(5);
    await expect(page.getByRole("tab").nth(3)).toHaveAccessibleName("Themes");
    await expect(page.getByRole("tab").nth(3)).toHaveAttribute("aria-selected", "true");
  } else {
    await expect(page.getByRole("navigation").getByRole("link", { name: "Themes", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("navigation").getByRole("link", { name: "Meters", exact: true })).toHaveAttribute("href", "/en/meters");
  }
  const cards = page.locator('a[href^="/en/themes/"]');
  await expect(cards).toHaveCount(entries.length);
  await expect(cards.first()).toHaveAttribute("href", `/en/themes/${byCount[0]![0]}`);
  const boxes = await cards.evaluateAll((links) => links.slice(0, 4).map((el) => el.getBoundingClientRect().top));
  const columns = info.project.name === "phone" ? 2 : 3;
  expect(boxes.filter((top) => top === boxes[0])).toHaveLength(columns);
  const blanks = cards.first().locator("..").locator(':scope > [aria-hidden="true"]').filter({ visible: true });
  const emptyCells = (columns - (entries.length % columns)) % columns;
  await expect(blanks).toHaveCount(emptyCells);
  if (emptyCells) {
    await expect(blanks.last()).toHaveCSS("border-top-width", entries.length >= columns ? "1px" : "0px");
    await expect(blanks.last()).toHaveCSS("border-inline-start-width", "1px");
  }
  await page.getByRole("button", { name: "By poem count" }).click();
  await page.getByRole("radio", { name: "Alphabetical" }).click();
  await expect(cards.first()).toHaveAttribute("href", `/en/themes/${byName[0]![0]}`);
  const search = page.getByRole("textbox", { name: "Search poetic themes" });
  await search.fill("zzzz");
  await expect(page.getByText("Nothing matches your search")).toBeVisible();
  await search.fill("الرِّثاء");
  await expect(cards).toHaveCount(1);
  await expect(blanks).toHaveCount(columns - 1);
  await expect(blanks.first()).toHaveCSS("border-inline-start-width", "1px");
  await expect(blanks.first()).toHaveCSS("border-top-width", "0px");
  await cards.first().click();
  await expect(page).toHaveURL(/\/en\/themes\/ritha$/);
  await expect(page.getByText(elegy.definition.en)).toBeVisible();
  await expect(
    page.getByText(`${catalog.poems.filter((p) => p.theme === "ritha").length} poems`, { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.locator('a[href="/en/poems/aya-umma-al-asir?b=15"]').click();
  await expect(page).toHaveURL(/\/en\/poems\/aya-umma-al-asir\?b=15$/);
  await expect(page.getByText("Verse 15 · Explanation", { exact: true }).filter({ visible: true }).first()).toBeVisible();
  if (info.project.name === "desktop") {
    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link")).toHaveCount(5);
    await expect(nav.getByRole("link", { name: /^(Meters|Rhymes)$/ })).toHaveCount(0);
  }
  await page.getByRole("link", { name: "Theme: Elegy", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/themes\/ritha$/);
});

test("only the primary theme gets a badge, and the meter badge opens the original meter index", async ({ page }) => {
  await page.goto("/en/poems/taqulu-buthaynatu");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("link", { name: "Theme: Love poetry", exact: true })).toHaveAttribute("href", "/en/themes/ghazal");
  await expect(page.locator('a[href="/en/themes/itab"]')).toHaveCount(0);
  await page.getByRole("button", { name: "About the poem", exact: true }).click();
  await expect(page.getByText("Other subjects", { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText("Reproach", { exact: true }).filter({ visible: true })).toBeVisible();
  const collapse = page.getByRole("button", { name: "Close the explanation" });
  if (await collapse.isVisible()) await collapse.click();
  await page.getByRole("link", { name: "Meter: al-Mutaqārib", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/meters\/mutaqarib$/);
  await page.getByRole("link", { name: "All meters" }).click();
  await expect(page).toHaveURL(/\/en\/meters$/);
  await expect(page.getByRole("link", { name: /al-Ṭawīl/ })).toBeVisible();
});

test("older v1 content still opens its poems and meters", async ({ page }) => {
  const poemPath = "/en/poems/taqulu-buthaynatu";
  await page.route("**/content/v1/catalog.json", async (route) => {
    const response = await route.fetch();
    const catalog: Catalog = await response.json();
    delete catalog.themes;
    for (const poem of catalog.poems) delete poem.theme;
    await route.fulfill({ response, json: catalog });
  });
  await page.route("**/content/v1/poems/taqulu-buthaynatu/en.json", async (route) => {
    const response = await route.fetch();
    const bundle: PoemBundle = await response.json();
    delete bundle.poem.themes;
    await route.fulfill({ response, json: bundle });
  });
  await page.goto("/en/themes");
  await expect(page.getByText("Themes are unavailable in this copy of the catalogue.")).toBeVisible();
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox").fill("تقول بثينة");
  await page.locator(`a[href="${poemPath}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(poemPath + "$"));
  await expect(page.locator('a[href="/en/themes/ghazal"]')).toHaveCount(0);
  await page.getByRole("link", { name: "Meter: al-Mutaqārib", exact: true }).click();
  await expect(page.getByRole("link", { name: "All meters" })).toBeVisible();
});
