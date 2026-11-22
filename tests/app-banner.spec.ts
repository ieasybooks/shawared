// The app bar: on a phone's browser, a bar above the page offers the app (app/+html.tsx,
// lib/stores appBanner). Safari on iPhones and iPads shows Apple's banner instead, which opens
// the app at the page. Each test opens its own browser as a kind of phone, so they run once,
// in the phone project.
import { expect, test, type Browser, type BrowserContextOptions, type Page } from "@playwright/test";

const POEM = "/poems/taqulu-buthaynatu";
const PLAY = "https://play.google.com/store/apps/details?id=com.shawared.app";
const intent = (path: string) =>
  `intent://${path}#Intent;scheme=shawared;package=com.shawared.app;S.browser_fallback_url=${encodeURIComponent(PLAY)};end`;

const UA = {
  android: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36",
  androidFacebook:
    "Mozilla/5.0 (Linux; Android 14; SM-S921B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.40.109;]",
  huawei:
    "Mozilla/5.0 (Linux; Android 10; NOH-NX9; HMSCore 6.15.0.302) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.196 HuaweiBrowser/15.0.4.312 Mobile Safari/537.36",
  harmonyNext:
    "Mozilla/5.0 (Phone; OpenHarmony 6.0; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 ArkWeb/6.0.0.130 Mobile HuaweiBrowser/5.1.12.351",
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.77 Mobile/15E148 Safari/604.1",
};

test.skip(({ isMobile }) => !isMobile, "each test opens its own phone");

/** A phone's browser, with the touch points a real one reports. */
async function phone(browser: Browser, userAgent: string, options: BrowserContextOptions = {}, touchPoints = 5) {
  const context = await browser.newContext({
    userAgent,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    ...options,
  });
  // Chromium's touch emulation reports one touch point.
  await context.addInitScript((n) => Object.defineProperty(Navigator.prototype, "maxTouchPoints", { get: () => n }), touchPoints);
  return context;
}

const bar = (page: Page) => page.locator("#app-banner");
const open = (page: Page) => bar(page).getByRole("link");
const rootTop = (page: Page) => page.locator("#root").evaluate((el) => el.getBoundingClientRect().top);
/** Where the page's first text is drawn. */
const firstText = (page: Page) =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll<HTMLElement>("#root [dir]")) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!own || el.closest("[inert]") || !el.checkVisibility()) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0) return { text: el.innerText.trim().slice(0, 40), x: Math.round(r.x), y: Math.round(r.y) };
    }
    return null;
  });
/** Keeps the test on the page when Open is pressed, after the bar has handled the press. */
const stayHere = (page: Page) =>
  page.evaluate(() => document.querySelector("#app-banner a")!.addEventListener("click", (e) => e.preventDefault()));
/** Waits for React to take over the page. */
const hydrated = (page: Page) =>
  page.waitForFunction(() => {
    const el = document.querySelector("#root [dir]");
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber"));
  });

test("an Android browser gets the bar above the page, and Open goes to the app at the page the reader is on", async ({ browser }) => {
  const context = await phone(browser, UA.android);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${POEM}?b=3`);
  await expect(bar(page)).toBeVisible();
  await expect(bar(page)).toHaveAccessibleName("استمع في تطبيق شوارد");
  await expect(bar(page)).toContainText("شوارد");
  await expect(open(page)).toHaveText("فتح");
  await expect(bar(page).getByRole("button", { name: "إغلاق" })).toBeVisible();
  await expect
    .poll(() =>
      bar(page)
        .locator("img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(open(page)).toHaveAttribute("href", intent("poems/taqulu-buthaynatu?b=3"));
  // At the top, across the window, with the page below it, all of it on screen.
  expect(await bar(page).boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 60 });
  expect(await rootTop(page)).toBe(60);
  expect(await page.locator("#root").evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(844);

  // Moved to another page within the site, Open follows.
  await hydrated(page);
  await page.evaluate(() => history.pushState(null, "", "/en/poets/jamil-buthayna"));
  await stayHere(page);
  await open(page).click();
  await expect(open(page)).toHaveAttribute("href", intent("en/poets/jamil-buthayna"));
  expect(errors).toEqual([]);
  await context.close();
});

test("the bar is drawn before the app's scripts run, and stays put when the app takes over", async ({ browser }) => {
  const context = await phone(browser, UA.android);
  const page = await context.newPage();
  const held: (() => Promise<void>)[] = [];
  let holding = true;
  await page.route("**/_expo/static/js/**", (route) => (holding ? held.push(() => route.continue()) : route.continue()));
  await page.goto(POEM, { waitUntil: "commit" });
  await page.waitForFunction(() => (document.getElementById("root")?.innerText ?? "").trim().length > 40);
  await expect(bar(page)).toBeVisible();
  await expect(open(page)).toHaveAttribute("href", intent("poems/taqulu-buthaynatu"));
  expect(await rootTop(page)).toBe(60);
  const before = await firstText(page);
  expect(before!.y).toBeGreaterThanOrEqual(60);

  holding = false;
  for (const go of held) await go();
  await hydrated(page);
  await page.waitForLoadState("networkidle");
  expect(await bar(page).boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 60 });
  expect(await rootTop(page)).toBe(60);
  expect(await firstText(page)).toEqual(before);
  await context.close();
});

test("Open pauses the poem playing on the page", async ({ browser }) => {
  const context = await phone(browser, UA.android);
  const page = await context.newPage();
  await page.goto(POEM);
  await hydrated(page);
  const live = (name: string) =>
    page.getByRole("button", { name, exact: true }).and(page.locator(":not([inert]):not([inert] *)")).filter({ visible: true }).first();
  await live("تشغيل").click();
  await expect(live("إيقاف مؤقت")).toBeVisible();
  await stayHere(page);
  await open(page).click();
  await expect(live("تشغيل")).toBeVisible();
  await context.close();
});

test("× hides the bar for the visit, and the page takes its room back", async ({ browser }) => {
  const context = await phone(browser, UA.android);
  const page = await context.newPage();
  await page.goto(POEM);
  await hydrated(page);
  await bar(page).getByRole("button", { name: "إغلاق" }).click();
  await expect(bar(page)).toBeHidden();
  expect(await rootTop(page)).toBe(0);
  // Pages moved to within the site keep it hidden; it's back on the next visit.
  await page.locator('a[href^="/poets/"]').filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/poets\//);
  await expect(bar(page)).toBeHidden();
  await page.reload();
  await expect(bar(page)).toBeVisible();
  await context.close();
});

test("the bar speaks the page's language, and follows the night theme", async ({ browser }) => {
  const context = await phone(browser, UA.android);
  await context.addInitScript(() => localStorage.setItem("shawared.settings.v1", JSON.stringify({ theme: "night" })));
  const page = await context.newPage();
  await page.goto(`/en${POEM}`);
  await expect(bar(page)).toHaveAccessibleName("Listen in the Shawared app");
  await expect(bar(page)).toContainText("Shawared");
  await expect(open(page)).toHaveText("Open");
  await expect(bar(page).getByRole("button", { name: "Close" })).toBeVisible();
  await expect(open(page)).toHaveAttribute("href", intent("en/poems/taqulu-buthaynatu"));
  // The night theme's raised surface (#1D2231), not the day's.
  await expect.poll(() => bar(page).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(29, 34, 49)");
  // Switched to Arabic in the app, the page's language changes, and the bar's with it.
  await hydrated(page);
  await page.evaluate(() => (document.documentElement.lang = "ar"));
  await expect(open(page)).toHaveText("فتح");
  await context.close();
});

for (const [device, userAgent, store, touchPoints] of [
  ["Chrome on an iPhone", UA.iphoneChrome, "https://apps.apple.com/app/id6836290037", 5],
  ["Facebook's browser on Android", UA.androidFacebook, PLAY, 5],
  ["Huawei's browser", UA.huawei, "https://appgallery.huawei.com/app/C119866441", 10],
] as const) {
  test(`${device}'s Open goes to the store page, which opens the app when it's there`, async ({ browser }) => {
    const context = await phone(browser, userAgent, {}, touchPoints);
    const page = await context.newPage();
    await page.goto(POEM);
    await expect(open(page)).toHaveAttribute("href", store);
    await context.close();
  });
}

test("Safari on an iPhone gets Apple's banner, at the page and its query, and no bar", async ({ browser }) => {
  const context = await phone(browser, UA.iphoneSafari);
  const page = await context.newPage();
  await page.goto(`${POEM}?b=2`);
  await expect(page.locator('meta[name="apple-itunes-app"]')).toHaveAttribute(
    "content",
    "app-id=6836290037, app-argument=https://shawared.com/poems/taqulu-buthaynatu?b=2",
  );
  await expect(bar(page)).toBeHidden();
  expect(await rootTop(page)).toBe(0);
  await context.close();
});

test("computers, HarmonyOS NEXT and an installed web app get no bar", async ({ browser }) => {
  const computer = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const harmony = await phone(browser, UA.harmonyNext, {}, 10);
  const installed = await phone(browser, UA.android);
  await installed.addInitScript(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = (q: string) => (q === "(display-mode: standalone)" ? ({ matches: true } as MediaQueryList) : real(q));
  });
  for (const context of [computer, harmony, installed]) {
    const page = await context.newPage();
    // Nor do they load its icon.
    const icons: string[] = [];
    page.on("request", (r) => r.url().endsWith("/apple-touch-icon.png") && icons.push(r.url()));
    await page.goto(POEM);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main, #root").first()).toBeVisible();
    await expect(bar(page)).toBeHidden();
    expect(await rootTop(page)).toBe(0);
    expect(icons).toEqual([]);
    await context.close();
  }
});

test("the app page has neither: it sends a phone straight to its store", async ({ request }) => {
  const html = await (await request.get("/app")).text();
  expect(html).not.toContain('id="app-banner"');
  expect(html).not.toContain("apple-itunes-app");
});
