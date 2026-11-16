import { expect, test, type Page } from "@playwright/test";

const POEM = "/poems/taqulu-buthaynatu";
const panelTitle = (page: Page) => page.getByText(/^البيت [٠-٩]+ · الشرح$/).first();
const playButton = (page: Page) => page.getByRole("button", { name: "تشغيل", exact: true });
const slider = (page: Page) => page.getByRole("slider").first();
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 960;

async function open(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(POEM);
  await expect(slider(page)).toBeVisible();
  return errors;
}

test("home lists the poem and opens it", async ({ page }) => {
  await page.goto("/");
  await page.getByText("تَقولُ بُثَينَةُ لَمّا رَأَت").first().click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
  await expect(slider(page)).toBeVisible();
});

test("playing moves the explanation from bayt to bayt", async ({ page }) => {
  const errors = await open(page);
  await expect(panelTitle(page)).toHaveText("البيت ١ · الشرح");
  await playButton(page).click();
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

test("tapping a bayt holds the explanation until Now playing", async ({ page }) => {
  await open(page);
  await playButton(page).click();
  await page.getByText("كَجَناحِ", { exact: true }).click();
  await expect(panelTitle(page)).toHaveText("البيت ٧ · الشرح");
  const nowPlaying = page.getByRole("button", { name: "البيت الحالي" });
  await expect(nowPlaying).toBeVisible();
  await nowPlaying.click();
  await expect(panelTitle(page)).not.toHaveText("البيت ٧ · الشرح");
});

test("a word with a meaning opens its card", async ({ page }) => {
  await open(page);
  await page.getByText("المَرزَبانِ", { exact: true }).first().click();
  await expect(page.getByText("رئيس من رؤساء الفرس", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "إغلاق" }).first().click();
  await expect(page.getByText("من البيت ٩ · الصدر")).toHaveCount(0);
});

test("English shows translations, and the switch hides them", async ({ page }) => {
  await open(page);
  if (isPhone(page)) await page.getByRole("button", { name: "المزيد", exact: true }).first().click();
  await page.getByRole("radio", { name: "English" }).click();
  const line = page.getByText("And you, like the marzuban's pearl,");
  await expect(line).toHaveCount(1);
  if (isPhone(page)) await page.getByRole("button", { name: "More", exact: true }).first().click();
  await page.getByRole("switch", { name: "Translation" }).click();
  await expect(line).toHaveCount(0);
});

test("scrolling pauses following for five seconds", async ({ page }) => {
  await open(page);
  const scrollTop = () => page.getByLabel("verses").evaluate((el) => el.scrollTop);
  await page.getByRole("button", { name: "شغّل من البيت ٨" }).click();
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
