// Playing on: when a poem ends, the next one in the list it was opened from plays, and its page
// follows; autoplay can be turned off; the browser's Media Session (phones' lock screens and
// notifications, desktops' media keys) shows the poem and controls it.
import { expect, test, type Locator, type Page } from "@playwright/test";

// Each test waits for a recording to end.
test.describe.configure({ timeout: 180_000 });

type CatalogPoem = { id: string; title: string; poet: string };

/** The home page's order, newest first, as the site publishes it. */
async function homeOrder(page: Page): Promise<CatalogPoem[]> {
  const res = await page.request.get("/content/v1/catalog.json");
  return ((await res.json()) as { poems: CatalogPoem[] }).poems;
}

/** What is on the current screen: screens you left stay mounted behind it, inert. */
const live = (page: Page, locator: Locator) => locator.and(page.locator(":not([inert]):not([inert] *)")).filter({ visible: true }).first();
const playButton = (page: Page) => live(page, page.getByRole("button", { name: "تشغيل", exact: true }));
const pauseButton = (page: Page) => live(page, page.getByRole("button", { name: "إيقاف مؤقت" }));
const autoplay = (page: Page) => live(page, page.getByRole("button", { name: "تشغيل القصيدة التالية تلقائيًا" }));
const poemUrl = (id: string) => new RegExp(`/poems/${id}$`);

const slider = (page: Page) => page.getByRole("slider").first();

/** Waits for the page to come alive: React has taken over the slider rendered ahead of time. */
async function hydrated(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('[role="slider"]');
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
  });
}

/**
 * Plays the poem on screen, then jumps to just before its end on the seek bar (its end is on the
 * left in Arabic). The poem may have ended by the time this returns.
 */
async function playNearEnd(page: Page) {
  await hydrated(page);
  await playButton(page).click();
  await expect(pauseButton(page)).toBeVisible();
  const box = (await slider(page).boundingBox())!;
  await slider(page).click({ position: { x: 2, y: box.height / 2 } });
}

/** Records the handlers the page gives the Media Session, to press its buttons as a lock screen or a media key would. */
async function watchMediaSession(page: Page) {
  await page.addInitScript(() => {
    const handlers: Record<string, ((details: object) => void) | null> = {};
    (window as unknown as { __media: typeof handlers }).__media = handlers;
    const set = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
    navigator.mediaSession.setActionHandler = (action, handler) => {
      handlers[action] = handler as (details: object) => void;
      set(action, handler);
    };
  });
}
const press = (page: Page, action: string, details: object = {}) =>
  page.evaluate(([a, d]) => (window as unknown as { __media: Record<string, (d: object) => void> }).__media[a as string]!(d as object), [
    action,
    details,
  ] as const);
const hasHandler = (page: Page, action: string) =>
  page.evaluate((a) => typeof (window as unknown as { __media: Record<string, unknown> }).__media[a] === "function", action);
const sessionTitle = (page: Page) => page.evaluate(() => navigator.mediaSession.metadata?.title ?? null);

test("when a poem ends, the next on the home page plays, and its page follows", async ({ page }) => {
  const poems = await homeOrder(page);
  const [first, next] = poems.slice(-2) as [CatalogPoem, CatalogPoem];
  await page.goto(`/poems/${first.id}`);
  await playNearEnd(page);
  await expect(page).toHaveURL(poemUrl(next.id), { timeout: 45_000 });
  await expect(live(page, page.getByText(next.title, { exact: true }))).toBeVisible();
  // Still playing, now the next poem.
  await expect(pauseButton(page)).toBeVisible();
});

test("a poem opened from a poet's page plays on into the poet's next poem", async ({ page }) => {
  const poems = await homeOrder(page);
  const counts = new Map<string, CatalogPoem[]>();
  for (const p of poems) counts.set(p.poet, [...(counts.get(p.poet) ?? []), p]);
  // A poet whose next poem isn't the next on the home page, so the two lists differ.
  const pick = [...counts.values()]
    .flatMap((list) => list.slice(0, -1).map((p, i) => [p, list[i + 1]!] as const))
    .find(([p, n]) => poems[poems.indexOf(p) + 1] !== n);
  expect(pick, "a poet with two poems apart on the home page").toBeTruthy();
  const [first, next] = pick!;
  await page.goto(`/poets/${first.poet}`);
  await live(page, page.getByText(first.title, { exact: true })).click();
  await expect(page).toHaveURL(poemUrl(first.id));
  await playNearEnd(page);
  await expect(page).toHaveURL(poemUrl(next.id), { timeout: 45_000 });
  await expect(pauseButton(page)).toBeVisible();
});

test("off, autoplay stops at the end of the poem", async ({ page }) => {
  const poems = await homeOrder(page);
  const [first] = poems.slice(-2) as [CatalogPoem];
  await page.goto(`/poems/${first.id}`);
  await expect(autoplay(page)).toHaveAttribute("aria-pressed", "true");
  await autoplay(page).click();
  await expect(autoplay(page)).toHaveAttribute("aria-pressed", "false");
  await playNearEnd(page);
  await expect(playButton(page)).toBeVisible({ timeout: 45_000 });
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(poemUrl(first.id));
  await expect(playButton(page)).toBeVisible();
  // Kept for next time.
  await page.reload();
  await expect(autoplay(page)).toHaveAttribute("aria-pressed", "false");
});

test("away from its page, the mini player moves on to the next poem", async ({ page }) => {
  const poems = await homeOrder(page);
  const [first, next] = poems.slice(-2) as [CatalogPoem, CatalogPoem];
  await page.goto(`/poems/${first.id}`);
  await playNearEnd(page);
  // Leave the poem inside the app: the header on wide windows, back on phones.
  await live(
    page,
    page
      .getByRole("tab", { name: "الشعراء" })
      .or(page.getByRole("navigation").getByRole("link", { name: "الشعراء" }))
      .or(page.getByRole("button", { name: "رجوع" })),
  ).click();
  await expect(page).not.toHaveURL(/\/poems\//);
  await expect(live(page, page.getByRole("link", { name: next.title, exact: true }))).toBeVisible({ timeout: 45_000 });
  await expect(page).not.toHaveURL(/\/poems\//);
});

test("the Media Session shows the poem and works its buttons", async ({ page }) => {
  await watchMediaSession(page);
  const poems = await homeOrder(page);
  const [before, last] = poems.slice(-2) as [CatalogPoem, CatalogPoem];
  await page.goto(`/poems/${last.id}`);
  await hydrated(page);
  await playButton(page).click();
  await expect.poll(() => sessionTitle(page)).toBe(last.title);
  const meta = await page.evaluate(() => {
    const m = navigator.mediaSession.metadata!;
    return { artist: m.artist, album: m.album, artwork: m.artwork.map((a) => a.src) };
  });
  expect(meta.artist).toMatch(/ · إلقاء /);
  expect(meta.album).toBe("شوارد");
  expect(meta.artwork).toHaveLength(1);
  expect(meta.artwork[0]).toMatch(/\/artwork\.png$/);
  const art = await page.request.get(meta.artwork[0]!);
  expect(art.ok()).toBe(true);
  expect(art.headers()["content-type"]).toContain("image/png");
  await expect.poll(() => page.evaluate(() => navigator.mediaSession.playbackState)).toBe("playing");
  // The last poem has a poem before it, and none after.
  expect(await hasHandler(page, "previoustrack")).toBe(true);
  expect(await hasHandler(page, "nexttrack")).toBe(false);
  // The lock screen's pause and play.
  await press(page, "pause");
  await expect(playButton(page)).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.mediaSession.playbackState)).toBe("paused");
  await press(page, "play");
  await expect(pauseButton(page)).toBeVisible();
  // Its scrubber.
  await press(page, "seekto", { seekTime: 20 });
  await expect
    .poll(async () => Number(await live(page, page.getByRole("slider")).getAttribute("aria-valuenow")))
    .toBeGreaterThanOrEqual(20);
  // Previous: the poem before, and the page follows it.
  await press(page, "previoustrack");
  await expect(page).toHaveURL(poemUrl(before.id), { timeout: 45_000 });
  await expect.poll(() => sessionTitle(page)).toBe(before.title);
  expect(await hasHandler(page, "nexttrack")).toBe(true);
  await press(page, "nexttrack");
  await expect(page).toHaveURL(poemUrl(last.id), { timeout: 45_000 });
});
