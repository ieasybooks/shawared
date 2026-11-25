import { expect, test } from "@playwright/test";
import type { Catalog } from "@shawared/contracts";
import { METER_IDS, meterName } from "../apps/app/src/lib/i18n";

for (const { path, order, alternative, rtl } of [
  { path: "/meters", order: "بحسب عدد القصائد", alternative: "بحسب الترتيب الهجائي", rtl: true },
  { path: "/en/reciters", order: "Alphabetical", alternative: "By recording count", rtl: false },
]) {
  test(`the sort menu overlays the first result on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const firstRow = page.locator(`a[href^="${path}/"]`).first();
    const firstHref = await firstRow.getAttribute("href");
    const trigger = page.getByRole("button", { name: order, exact: true });
    const row = (await firstRow.boundingBox())!;
    const button = (await trigger.boundingBox())!;
    await trigger.click();
    const menu = page.getByRole("radiogroup");
    await expect(menu.getByRole("radio", { name: order })).toBeChecked();
    const panel = (await menu.boundingBox())!;
    expect((await firstRow.boundingBox())!.y).toBeCloseTo(row.y, 0);
    expect(panel.y).toBeGreaterThanOrEqual(button.y + button.height - 1);
    expect(panel.y).toBeLessThan(row.y + row.height);
    expect(panel.y + panel.height).toBeGreaterThan(row.y);
    expect(rtl ? panel.x : panel.x + panel.width).toBeCloseTo(rtl ? button.x : button.x + button.width, 0);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await trigger.click();
    await expect(menu).toBeVisible();
    // A tap through the backdrop would open this first result.
    await page.mouse.click(rtl ? row.x + row.width - 4 : row.x + 4, row.y + 12);
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(new RegExp(path + "$"));
    await trigger.click();
    await menu.getByRole("radio", { name: alternative }).click();
    await expect(menu).toBeHidden();
    await expect(firstRow).not.toHaveAttribute("href", firstHref!);
  });
}

test("era, name search and sort work together and survive a visit to the poet", async ({ page }, info) => {
  await page.goto("/en/poets");
  await page.waitForLoadState("networkidle");
  const eras = page.locator('button[aria-pressed], [role="button"][aria-pressed]').filter({ hasText: /poets?/i });
  const isPhone = info.project.name === "phone";
  const visible = eras.filter({ visible: true });
  const blanks = visible.first().locator("..").locator(':scope > [aria-hidden="true"]').filter({ visible: true });
  if (isPhone) {
    await expect(visible).toHaveCount(4);
    await expect(blanks).toHaveCount(0);
    await page.getByRole("button", { name: "Show all eras" }).click();
  } else {
    await expect(page.getByRole("button", { name: "Show all eras" })).toHaveCount(0);
  }
  const tops = await visible.evaluateAll((cards) => cards.map((el) => el.getBoundingClientRect().top));
  const columns = isPhone ? 2 : 3;
  expect(tops.filter((top) => top === tops[0])).toHaveLength(columns);
  await expect(blanks).toHaveCount((columns - (tops.length % columns)) % columns);
  const abbasid = page.getByRole("button", { name: /^Abbasid/ });
  await abbasid.click();
  await page.getByRole("button", { name: "Alphabetical", exact: true }).click();
  await page.getByRole("radio", { name: "By poem count" }).click();
  const search = page.getByRole("textbox", { name: "Search the poets" });
  await search.fill("المتنبي");
  const poet = page.getByRole("link", { name: /al-Mutanabbi/i });
  await poet.click();
  await expect(page).toHaveURL(/\/en\/poets\/al-mutanabbi$/);
  await page.getByRole("button", { name: "Back", exact: true }).filter({ visible: true }).click();
  await expect(abbasid).toHaveAttribute("aria-pressed", "true");
  await expect(search).toHaveValue("المتنبي");
  await expect(page.getByRole("button", { name: "By poem count", exact: true })).toBeVisible();
  await search.fill("Jamil");
  await expect(page.getByText("Nothing matches your search")).toBeVisible();
  await page.getByRole("button", { name: "All poets", exact: true }).click();
  await expect(page.getByRole("link", { name: /Jamil Buthayna/ })).toBeVisible();
});

test("reciters sort by recordings, including two performances of the same poem", async ({ page }) => {
  await page.route("**/content/v1/catalog.json", async (route) => {
    const response = await route.fetch();
    const c: Catalog = await response.json();
    const poem = c.poems.find((p) => p.recitations.some((r) => r.reciter === "abd-al-rahman-al-humayn"))!;
    const recording = poem.recitations.find((r) => r.reciter === "abd-al-rahman-al-humayn")!;
    poem.recitations.push({ ...recording, id: "second-performance" });
    await route.fulfill({ response, json: c });
  });
  await page.goto("/en/reciters");
  await page.waitForLoadState("networkidle");
  const rows = page.locator('a[href^="/en/reciters/"]');
  await expect(rows.first()).toContainText("Abd al-Rahman al-Humayn");
  await expect(rows.first()).toContainText("4 recordings");
  await page.getByRole("button", { name: "Alphabetical" }).click();
  await page.getByRole("radio", { name: "By recording count" }).click();
  await expect(rows.first()).toContainText("Osama Al-Waaedh");
});

test("the poem opens its rhyme and meter, and both indexes sort", async ({ page, request }, info) => {
  const c: Catalog = await (await request.get("/content/v1/catalog.json")).json();
  await page.goto("/en/poems/aya-umma-al-asir");
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Rhyme: rāʾ", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/rhymes\/ra$/);
  await expect(
    page
      .getByText(c.poems.filter((p) => p.rawiy === "ر").length + " poems", { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "All rhymes" }).click();
  await expect(page).toHaveURL(/\/en\/rhymes$/);
  const rhymes = page.locator('a[href^="/en/rhymes/"]').filter({ visible: true });
  await expect(rhymes.first()).toHaveAttribute("href", "/en/rhymes/hamza");
  await page.getByRole("button", { name: "By rhyme letter" }).click();
  await page.getByRole("radio", { name: "By poem count" }).click();
  const counts = new Map<string, number>();
  for (const p of c.poems) if (p.rawiy) counts.set(p.rawiy, (counts.get(p.rawiy) ?? 0) + 1);
  await expect(rhymes.first()).toContainText(Math.max(...counts.values()) + " poems");
  if (info.project.name === "desktop") {
    await expect(page.getByRole("navigation").getByRole("link", { name: "Rhymes", exact: true })).toHaveAttribute("aria-current", "page");
  }
  await page.goto("/en/poems/aya-umma-al-asir");
  await page.getByRole("link", { name: "Meter: al-Wāfir", exact: true }).click();
  await page.getByRole("link", { name: "All meters" }).click();
  const meters = page.locator('a[href^="/en/meters/"]').filter({ visible: true });
  await expect(meters.first()).toContainText(Math.max(...Object.values(c.meters)) + " poems");
  await page.getByRole("button", { name: "By poem count" }).click();
  await page.getByRole("radio", { name: "Alphabetical" }).click();
  const first = [...METER_IDS].sort((a, b) => meterName(a, "en").localeCompare(meterName(b, "en"), "en", { sensitivity: "base" }))[0];
  await expect(meters.first()).toHaveAttribute("href", "/en/meters/" + first);
});

test("an older catalogue keeps every poet searchable when it replaces a filtered preview", async ({ page }) => {
  let letCatalogueThrough!: () => void;
  const held = new Promise<void>((resolve) => {
    letCatalogueThrough = resolve;
  });
  let received!: () => void;
  const requested = new Promise<void>((resolve) => {
    received = resolve;
  });
  await page.route("**/content/v1/catalog.json", async (route) => {
    const response = await route.fetch();
    const catalog: Catalog = await response.json();
    for (const poet of Object.values(catalog.poets)) delete poet.era;
    received();
    await held;
    await route.fulfill({ response, json: catalog });
  });
  try {
    await page.goto("/en/poets");
    await requested;
    const early = page.getByRole("button", { name: /^Pre-Islamic/ });
    await early.click();
    await expect(early).toHaveAttribute("aria-pressed", "true");
  } finally {
    letCatalogueThrough();
  }
  await expect(page.getByRole("heading", { name: "Eras", exact: true })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Search the poets" }).fill("المتنبي");
  await expect(page.getByRole("link", { name: /al-Mutanabbi/i })).toBeVisible();
});
