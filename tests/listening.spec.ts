import { expect, test, type Page } from "@playwright/test";
import { scrollToRow } from "./scroll-to-row";

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

test("home lists the poem and opens it", async ({ page }) => {
  await page.goto("/");
  await (await scrollToRow(page, "تَقولُ بُثَينَةُ لَمّا رَأَت")).click();
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
  // Wide windows have two: the big one beside the title, and the player bar's.
  await expect(page.getByRole("button", { name: "إيقاف مؤقت" }).first()).toBeVisible();
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

test("the poem opens on its introduction; the recitation and the info button move between it and the verses", async ({ page }) => {
  await open(page);
  const intro = page
    .getByText(/^رأت بثينة الشيب/)
    .filter({ visible: true })
    .first();
  const about = page.getByRole("button", { name: "عن القصيدة" });
  await expect(intro).toBeVisible();
  await expect(about).toHaveAttribute("aria-pressed", "true");
  await playButton(page).click();
  await expect(panelTitle(page)).toHaveText("البيت ١ · الشرح");
  await expect(about).toHaveAttribute("aria-pressed", "false");
  // The info button brings the introduction back, and it stays while the recitation goes on.
  await about.click();
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

test("the poem badges fit closely between the title and the first verse and keep a full tap target", async ({ page }, info) => {
  await open(page);
  await page.evaluate(() => document.fonts.ready.then(() => {}));
  const theme = page.getByRole("link", { name: "الغرض: الغزل", exact: true });
  const title = page.getByText("تَقولُ بُثَينَةُ لَمّا رَأَت", { exact: true }).filter({ visible: true }).first();
  const [heading, target, badge, verse] = await Promise.all([
    title.boundingBox(),
    theme.boundingBox(),
    theme.locator(":scope > :first-child").boundingBox(),
    page.getByLabel("البيت ١", { exact: true }).boundingBox(),
  ]);
  expect(target!.height).toBeGreaterThanOrEqual(44);
  const gapAbove = badge!.y - (heading!.y + heading!.height);
  expect(gapAbove).toBeGreaterThanOrEqual(8);
  expect(gapAbove).toBeLessThanOrEqual(12);
  const gapBelow = verse!.y - (badge!.y + badge!.height);
  expect(gapBelow).toBeGreaterThanOrEqual(0);
  expect(gapBelow).toBeLessThanOrEqual(1);
  if (info.project.name === "phone") {
    const [back, appearance, playlist, language, favourite, number] = await Promise.all(
      ["رجوع", "المظهر الليلي", "أضف إلى قائمة", "اللغة", "أضف إلى المفضّلة", "شغّل من البيت ١"].map((name) =>
        page.getByRole("button", { name, exact: true }).boundingBox(),
      ),
    );
    expect(heading!.x + heading!.width).toBeCloseTo(back!.x + back!.width, 0);
    expect(playlist!.x + playlist!.width / 2).toBeCloseTo(appearance!.x + appearance!.width / 2, 0);
    expect(favourite!.x + favourite!.width / 2).toBeCloseTo(language!.x + language!.width / 2, 0);
    expect(number!.x + number!.width / 2).toBeCloseTo(back!.x + back!.width / 2, 0);
    const poet = await page
      .locator('a[href="/poets/jamil-buthayna"]')
      .filter({ visible: true })
      .locator(":scope > :last-child")
      .boundingBox();
    expect(heading!.y - (poet!.y + poet!.height)).toBeGreaterThanOrEqual(8);

    const halves = await page
      .getByLabel("البيت ١", { exact: true })
      .evaluate((el) =>
        [...el.querySelectorAll<HTMLElement>("div")]
          .filter((d) => d.style.width && getComputedStyle(d).justifyContent === "space-between")
          .map((d) => d.getBoundingClientRect().toJSON()),
      );
    const preview = await page.getByRole("button", { name: "افتح الشرح", exact: true }).locator(":scope > :last-child").boundingBox();
    const continuous = await page.getByRole("button", { name: "تشغيل القصيدة التالية تلقائيًا", exact: true }).boundingBox();
    const repeat = await page.getByRole("button", { name: "التكرار: متوقف", exact: true }).boundingBox();
    expect(halves[1]!.x).toBeCloseTo(preview!.x, 0);
    expect(continuous!.x + continuous!.width / 2).toBeCloseTo(appearance!.x + appearance!.width / 2, 0);
    expect(repeat!.x + repeat!.width / 2).toBeCloseTo(language!.x + language!.width / 2, 0);
    expect(continuous!.width).toBeGreaterThanOrEqual(34);
  }
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

test("a focused meaning stays visible after its panel lays out again", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "المَرزَبانِ", exact: true }).first().click();
  const focused = page.locator("[aria-current='true']").filter({ visible: true });
  await expect(focused).toBeInViewport({ ratio: 1 });
  await expect
    .poll(() =>
      page.locator("[data-panel]").evaluate((el) => {
        const transform = getComputedStyle(el).transform;
        return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
      }),
    )
    .toBe(0);

  // A later layout can move a note without resizing the note itself.
  await focused.evaluate((el) => {
    (el as HTMLElement).style.marginTop = "600px";
  });
  await expect(focused).toBeInViewport({ ratio: 1 });
});

test("translation layout changes keep the playing verse in view", async ({ page }) => {
  await page.goto(`/en${POEM}`);
  const row = page.getByLabel("Verse 9", { exact: true });
  await page.getByRole("button", { name: "Play from verse 9", exact: true }).click();
  await expect(row).toBeInViewport({ ratio: 1 });
  await page.getByRole("button", { name: "Pause", exact: true }).filter({ visible: true }).first().click();
  const translation = page.getByRole("switch", { name: "Translation", exact: true });
  await translation.click();
  await expect(translation).toHaveAttribute("aria-checked", "false");
  await expect(row).toBeInViewport({ ratio: 1 });
  await translation.click();
  await expect(translation).toHaveAttribute("aria-checked", "true");
  await expect(row).toBeInViewport({ ratio: 1 });
});

test("space controls only the current poem when earlier poem pages stay mounted", async ({ page }) => {
  const response = await page.request.get("/content/v1/catalog.json");
  const { poems } = (await response.json()) as { poems: { id: string; title: string; poet: string }[] };
  const first = poems.find((p) => poems.some((other) => other.id !== p.id && other.poet === p.poet))!;
  const next = poems.find((p) => p.id !== first.id && p.poet === first.poet)!;
  await page.goto(`/poems/${first.id}`);
  await playButton(page).click();
  await expect.poll(() => page.evaluate(() => navigator.mediaSession.playbackState)).toBe("playing");
  await page.locator(`a[href="/poets/${first.poet}"]`).filter({ visible: true }).first().click();
  await (await scrollToRow(page, next.title)).click();
  await expect(page).toHaveURL(new RegExp(`/poems/${next.id}$`));
  await expect.poll(() => page.locator("[inert] [aria-label='verses']").count()).toBeGreaterThan(0);

  await page.keyboard.press("Space");
  await expect.poll(() => page.evaluate(() => navigator.mediaSession.metadata?.title)).toBe(next.title);
  await expect.poll(() => page.evaluate(() => navigator.mediaSession.playbackState)).toBe("playing");
  await page.keyboard.press("Space");
  await expect.poll(() => page.evaluate(() => navigator.mediaSession.playbackState)).toBe("paused");
  expect(await page.evaluate(() => navigator.mediaSession.metadata?.title)).toBe(next.title);
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
  await expect.poll(background).toBe("rgb(18, 21, 31)");
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
