import { expect, test, type Page, type Route } from "@playwright/test";

// Pages are rendered ahead of time once, for every window: CSS lays them out for phones or
// for wide windows from WIDE_MIN (apps/app/src/lib/responsive.tsx). These tests hold the
// scripts back, so the page is what the browser paints before the app runs, then let the app
// take over and check that nothing moves, and that resizing switches the layout.
const WIDE_MIN = 960;
const POEM = "/poems/taqulu-buthaynatu";
const PAGES = ["/", POEM, "/poets/jamil-buthayna", "/themes", "/themes/ritha", "/poets", "/reciters", "/rhymes", "/rhymes/ra"];

type Box = { text: string; x: number; y: number; w: number; h: number };

/** Every text on screen, with where it is. */
const textBoxes = (page: Page): Promise<Box[]> =>
  page.evaluate(() => {
    const out: { text: string; x: number; y: number; w: number; h: number }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("#root [dir]")) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!own || el.closest("[inert]") || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      out.push({
        text: el.innerText.trim().slice(0, 40),
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
    return out;
  });

/** Opens `path` with the app's scripts held back; `release` lets them run. */
async function openHeld(page: Page, path: string) {
  const held: Route[] = [];
  let holding = true;
  await page.route("**/_expo/static/js/**", (route) => (holding ? held.push(route) : route.continue()));
  await page.goto(path, { waitUntil: "commit" });
  await page.waitForFunction(() => (document.getElementById("root")?.innerText ?? "").trim().length > 40);
  await page.evaluate(() => document.fonts.ready.then(() => {}));
  // A frame for the fonts to be drawn with.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return async () => {
    holding = false;
    await page.evaluate(() => {
      // Layout shifts from here on: the app taking over.
      const w = window as unknown as { __shift: number };
      w.__shift = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
          if (!e.hadRecentInput) w.__shift += e.value;
      }).observe({ type: "layout-shift" });
    });
    for (const route of held) await route.continue();
    // React has taken over the markup.
    await page.waitForFunction(() => {
      const el = document.querySelector("#root [dir]");
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber"));
    });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
  };
}

/** The layout on screen: the sidebar's navigation on wide windows, the top bar's or tab bar's on phones. */
async function expectLayout(page: Page, layout: "phone" | "wide", path: string) {
  const nav = page.getByRole("navigation");
  if (layout === "wide") {
    await expect(nav).toBeVisible();
    await expect(page.getByRole("tablist")).toBeHidden();
  } else {
    await expect(nav).toBeHidden();
    // The tab pages show the tabs; a poem or a poet has back in the top bar.
    await expect(
      ["/", "/poets", "/reciters", "/themes", "/library"].includes(path)
        ? page.getByRole("tablist")
        : page.getByRole("button", { name: "رجوع" }).first(),
    ).toBeVisible();
  }
}

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

for (const path of PAGES) {
  test(`${path} shows in its layout before the app runs, and the app takes over without a shift`, async ({ page }, info) => {
    // Phones at their own width; desktop just below WIDE_MIN, at it, and at its own width.
    const widths = info.project.name === "phone" ? [page.viewportSize()!.width] : [WIDE_MIN - 1, WIDE_MIN, page.viewportSize()!.width];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const errors = watchErrors(page);
      const release = await openHeld(page, path);
      const layout = width >= WIDE_MIN ? "wide" : "phone";
      await expectLayout(page, layout, path);
      const before = await textBoxes(page);
      expect(before.length, `${width}`).toBeGreaterThan(5);

      await release();
      await expectLayout(page, layout, path);
      expect(await page.evaluate(() => (window as unknown as { __shift: number }).__shift), `layout shift at ${width}`).toBe(0);
      const after = await textBoxes(page);
      // Every text painted before the app ran is where it was.
      for (const box of before) expect(after, `${box.text} at ${width}`).toContainEqual(box);
      expect(errors, `errors at ${width}`).toEqual([]);
      await page.unroute("**/_expo/static/js/**");
    }
  });
}

test("resizing across WIDE_MIN switches the layout, and the poem's explanation moves beside the verses", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "a desktop window resizes");
  const errors = watchErrors(page);
  await page.setViewportSize({ width: WIDE_MIN - 1, height: 900 });
  await page.goto(POEM);
  await page.waitForLoadState("networkidle");
  const verses = page.getByLabel("verses");
  const panel = page.locator("[data-panel]");
  const panelStyle = () =>
    panel.evaluate((el) => {
      const s = getComputedStyle(el);
      return { position: s.position, opacity: s.opacity, transform: s.transform };
    });
  // The introduction in the explanation (the peek above the phone's player quotes it too).
  const intro = panel.getByText(/^رأت بثينة الشيب/);
  await expectLayout(page, "phone", POEM);
  // On phones the explanation waits in its sheet, put away over the player.
  await expect.poll(panelStyle).toMatchObject({ position: "absolute", opacity: "0" });

  await page.setViewportSize({ width: WIDE_MIN, height: 900 });
  await expectLayout(page, "wide", POEM);
  await expect.poll(panelStyle).toEqual({ position: "relative", opacity: "1", transform: "none" });
  await expect(intro).toBeInViewport();
  const [list, text] = await Promise.all([verses.boundingBox(), intro.boundingBox()]);
  // The explanation is the sidebar, at the start: in Arabic, on the verses' right.
  expect(text!.x).toBeGreaterThanOrEqual(list!.x + list!.width - 1);

  await page.setViewportSize({ width: WIDE_MIN - 1, height: 900 });
  await expectLayout(page, "phone", POEM);
  await expect.poll(panelStyle).toMatchObject({ position: "absolute", opacity: "0" });
  // A bayt tapped on a phone opens the sheet over the verses.
  await page.getByLabel("البيت ٣", { exact: true }).click({ position: { x: 4, y: 4 } });
  await expect.poll(panelStyle).toMatchObject({ position: "absolute", opacity: "1" });
  await expect(panel.getByText("البيت ٣ · الشرح")).toBeInViewport();
  expect(errors).toEqual([]);
});
