import { expect, test, type Page } from "@playwright/test";

const POEM = "/poems/taqulu-buthaynatu";
const panelTitle = (page: Page) => page.getByText(/^البيت [٠-٩]+ · الشرح$/).first();
const playButton = (page: Page) => page.getByRole("button", { name: "تشغيل", exact: true });
const slider = (page: Page) => page.getByRole("slider").first();
/** A word of a verse, however much kashida it is shown with. */
const verseWord = (page: Page, word: string) => page.getByText(new RegExp(`^${[...word].join("ـ*")}$`));

async function open(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(POEM);
  await expect(slider(page)).toBeVisible();
  return errors;
}

/** Scrolls the home page's list until the poem's card is drawn: it lists many poems, newest first. */
async function scrollToCard(page: Page, title: string) {
  const card = page.getByText(title, { exact: true }).filter({ visible: true }).first();
  await page.waitForLoadState("networkidle");
  for (let i = 0; i < 80 && !(await card.count()); i++) {
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("div")) {
        const o = getComputedStyle(el).overflowY;
        if ((o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight && !el.closest("[inert]")) el.scrollBy(0, 400);
      }
    });
    await page.waitForTimeout(150);
  }
  return card;
}

test("home lists the poem and opens it", async ({ page }) => {
  await page.goto("/");
  await (await scrollToCard(page, "تَقولُ بُثَينَةُ لَمّا رَأَت")).click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
  await expect(slider(page)).toBeVisible();
});

test("playing moves the explanation from bayt to bayt", async ({ page }) => {
  const errors = await open(page);
  await playButton(page).click();
  await expect(panelTitle(page)).toHaveText("البيت ١ · الشرح");
  // Bayt 2 starts at 8.54 s.
  await expect(panelTitle(page)).toHaveText("البيت ٢ · الشرح", { timeout: 15_000 });
  expect(errors).toEqual([]);
});

test("a bayt number plays from that bayt", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "شغّل من البيت ٩" }).click();
  await expect(panelTitle(page)).toHaveText("البيت ٩ · الشرح");
  await expect.poll(async () => Number(await slider(page).getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(52);
  await expect(page.getByRole("button", { name: "إيقاف مؤقت" })).toBeVisible();
});

test("playing a bayt in view leaves the list still, and the player names that bayt at once", async ({ page }) => {
  await open(page);
  const scrollTop = () => page.getByLabel("verses").evaluate((el) => el.scrollTop);
  await page.getByRole("button", { name: "شغّل من البيت ٢" }).click();
  // Playback starts a moment early (the run-up); the bayt is still the one pressed.
  // Pages hold both players, the phone's and the wide window's; CSS shows one.
  await expect(
    page
      .getByText(/البيت ٢ من ١٠/)
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await page.waitForTimeout(1500);
  expect(await scrollTop()).toBe(0);
});

test("a bayt out of view comes into view in one move, a fifth of the way down", async ({ page }) => {
  await open(page);
  const list = page.getByLabel("verses");
  const tops: number[] = [];
  const watch = setInterval(
    () =>
      list
        .evaluate((el) => el.scrollTop)
        .then(
          (y) => tops.push(y),
          () => {},
        ),
    40,
  );
  await page.getByRole("button", { name: "شغّل من البيت ٩" }).click();
  await page.waitForTimeout(1600);
  clearInterval(watch);
  // One move: the list never goes back the way it came.
  for (let i = 1; i < tops.length; i++) expect(tops[i]!).toBeGreaterThanOrEqual(tops[i - 1]! - 1);
  const [row, view] = await Promise.all([page.getByLabel("البيت ٩", { exact: true }).boundingBox(), list.boundingBox()]);
  expect(row!.y - view!.y).toBeGreaterThan(0);
  expect(row!.y + row!.height).toBeLessThan(view!.y + view!.height);
});

test("tapping a bayt holds the explanation until Now playing", async ({ page }) => {
  await open(page);
  await playButton(page).click();
  await verseWord(page, "كَجَناحِ").click();
  await expect(panelTitle(page)).toHaveText("البيت ٧ · الشرح");
  const nowPlaying = page.getByRole("button", { name: "البيت الحالي" });
  await expect(nowPlaying).toBeVisible();
  await nowPlaying.click();
  await expect(panelTitle(page)).not.toHaveText("البيت ٧ · الشرح");
});

test("the poem opens on its introduction; the recitation and the chip move between it and the verses", async ({ page }) => {
  await open(page);
  const intro = page
    .getByText(/^رأت بثينة الشيب/)
    .filter({ visible: true })
    .first();
  const chip = page.getByRole("button", { name: "عن القصيدة" });
  await expect(intro).toBeVisible();
  await expect(chip).toHaveAttribute("aria-selected", "true");
  await playButton(page).click();
  await expect(panelTitle(page)).toHaveText("البيت ١ · الشرح");
  await expect(chip).toHaveAttribute("aria-selected", "false");
  // The chip brings the introduction back, and it stays while the recitation goes on.
  await chip.click();
  await expect(
    page
      .getByText(/^رأت بثينة الشيب/)
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "البيت الحالي" }).filter({ visible: true }).first().click();
  await expect(panelTitle(page)).toHaveText(/^البيت [٠-٩]+ · الشرح$/);
  // The poet's life is on the poet's page, not under the poem.
  await expect(page.getByText(/قبيلة عذرة|بني عُذرة/)).toHaveCount(0);
});

test("a word opens its own bayt, its meaning brought forward", async ({ page }) => {
  await open(page);
  // Hold bayt 3, then tap a word of bayt 9.
  await verseWord(page, "بِاللِّوى").click();
  await expect(panelTitle(page)).toHaveText("البيت ٣ · الشرح");
  const close = page.getByRole("button", { name: "أغلق الشرح" });
  if (await close.isVisible()) await close.click();
  // Shown stretched (المَــرزَبانِ); its button keeps the word's own spelling.
  await page.getByRole("button", { name: "المَرزَبانِ", exact: true }).first().click();
  await expect(panelTitle(page)).toHaveText("البيت ٩ · الشرح");
  const focused = page.locator("[aria-current='true']").filter({ visible: true });
  await expect(focused).toHaveCount(1);
  await expect(focused).toContainText("رئيس من رؤساء الفرس");
  await expect(focused).toBeInViewport();
});

test("English shows translations, and the switch hides them", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "اللغة" }).click();
  await page.getByRole("menuitem", { name: "English" }).click();
  const line = page.getByText("And you, like the marzuban's pearl,");
  await expect(line).toHaveCount(1);
  await expect(page.getByRole("menuitem")).toHaveCount(0);
  await page.getByRole("switch", { name: "Translation" }).click();
  await expect(line).toHaveCount(0);
});

test("one button switches between day and night", async ({ page }) => {
  await open(page);
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await background()).toBe("rgb(243, 240, 232)");
  await page.getByRole("button", { name: "المظهر الليلي" }).click();
  await expect.poll(background).toBe("rgb(19, 26, 46)");
  await page.getByRole("button", { name: "المظهر النهاري" }).click();
  await expect.poll(background).toBe("rgb(243, 240, 232)");
});

test("scrolling pauses following for five seconds", async ({ page }) => {
  await open(page);
  const scrollTop = () => page.getByLabel("verses").evaluate((el) => el.scrollTop);
  // Bayt 9 starts out of view on phones and desktops alike, so the list has to follow it.
  await page.getByRole("button", { name: "شغّل من البيت ٩" }).click();
  await page.waitForTimeout(2000);
  const following = await scrollTop();
  expect(following).toBeGreaterThan(0);
  // The reader scrolls back to the top.
  await page.getByLabel("verses").evaluate((el) => el.scrollTo({ top: 0 }));
  await page.waitForTimeout(3500);
  expect(await scrollTop()).toBe(0);
  // Five seconds after the scroll, the list glides back to the playing bayt.
  await expect.poll(scrollTop, { timeout: 8_000 }).toBeGreaterThan(following * 0.8);
});

test("no sideways scrolling", async ({ page }) => {
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("every half is as wide as the poem's longest, on one line", async ({ page }) => {
  await open(page);
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[aria-label^='البيت'] div")]
      .filter((d) => d.style.width && getComputedStyle(d).justifyContent === "space-between")
      .map((d) => ({
        width: Math.round(d.getBoundingClientRect().width),
        height: d.getBoundingClientRect().height,
        text: d.textContent ?? "",
      })),
  );
  expect(boxes).toHaveLength(20);
  expect(new Set(boxes.map((b) => b.width)).size).toBe(1);
  for (const b of boxes) expect(b.height, b.text).toBeLessThan(60);
  // The kashida is shown, never part of the text: without it, the halves are the poem's own.
  expect(boxes.some((b) => b.text.includes("ـ"))).toBe(true);
  expect(boxes[0]!.text.replace(/ـ/g, "")).toBe("تَقولُبُثَينَةُلَمّارَأَت");
});

test("the explanation shows its bayt at the poem's measure too", async ({ page }) => {
  await open(page);
  // Hold bayt 2 (the poem opens on its introduction); phones open the explanation with it.
  await verseWord(page, "جَميلُ").click();
  // Measured halves outside the verse list: the explanation's bayt, in the smaller verse size.
  const halves = () =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("div")]
        .filter((d) => d.style.width && getComputedStyle(d).justifyContent === "space-between" && !d.closest("[aria-label^='البيت']"))
        .filter((d) => d.getBoundingClientRect().width > 0)
        .map((d) => ({ width: Math.round(d.getBoundingClientRect().width), height: d.getBoundingClientRect().height })),
    );
  await expect.poll(async () => (await halves()).length).toBe(2);
  const [sadr, ajuz] = await halves();
  expect(sadr!.width).toBe(ajuz!.width);
  // 9.235 em of the 17 px verse.
  expect(sadr!.width).toBe(157);
  expect(Math.max(sadr!.height, ajuz!.height)).toBeLessThan(50);
});
