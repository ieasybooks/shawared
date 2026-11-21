// What the reader keeps (features/saved): favourite poems, poets and reciters, and playlists,
// saved in the browser and shown in the library tab. Downloads are the apps' only.
import { expect, test, type Locator, type Page } from "@playwright/test";

type CatalogPoem = { id: string; title: string; poet: string; recitations: { reciter: string }[] };
type Catalog = { poems: CatalogPoem[]; poets: Record<string, { name: string }>; reciters: Record<string, { name: string }> };

async function catalogOf(page: Page): Promise<Catalog> {
  const res = await page.request.get("/content/v1/catalog.json");
  return (await res.json()) as Catalog;
}

/** What is on the current screen: screens you left stay mounted behind it, inert. */
const live = (page: Page, locator: Locator) => locator.and(page.locator(":not([inert]):not([inert] *)")).filter({ visible: true }).first();
const button = (page: Page, name: string) => live(page, page.getByRole("button", { name, exact: true }));
/** A section of the app: a tab on phones, a link in the header's navigation on wide windows. */
const section = (page: Page, name: string) =>
  live(page, page.getByRole("tab", { name, exact: true }).or(page.getByRole("navigation").getByRole("link", { name, exact: true })));
/** A verse or a title on screen, whatever kashida stretches it with. */
const titled = (page: Page, title: string) => live(page, page.getByText(new RegExp(`^${[...title].join("ـ*")}$`)));

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** Opens a page and waits until React has taken it over, so taps do something. */
async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => {
    // The app's, not the app bar's above it (app/+html.tsx), which React never takes over.
    const el = document.querySelector('#root [role="button"], #root button');
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
  });
}

/** The library tab: from the header on wide windows; phones show the tabs only on tab pages. */
async function openLibrary(page: Page) {
  const tab = section(page, "مكتبتي");
  if (await tab.isVisible()) await tab.click();
  else await open(page, "/library");
  await expect(page).toHaveURL(/\/library$/);
}

/** Closes a menu by tapping beside it. */
async function closeMenu(page: Page) {
  const size = page.viewportSize()!;
  await live(page, page.getByLabel("إغلاق", { exact: true })).click({ position: { x: 8, y: size.height - 8 } });
}

test("a poem's heart keeps it in the library, after a reload too", async ({ page }) => {
  const errors = watchErrors(page);
  const [poem] = (await catalogOf(page)).poems;
  await open(page, `/poems/${poem!.id}`);
  await button(page, "أضف إلى المفضّلة").click();
  await expect(button(page, "أزل من المفضّلة")).toHaveAttribute("aria-pressed", "true");

  await openLibrary(page);
  await expect(live(page, page.getByText("القصائد المفضّلة"))).toBeVisible();
  await expect(titled(page, poem!.title)).toBeVisible();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(titled(page, poem!.title)).toBeVisible();

  // Taken out again on its page: the library has nothing left but the hint.
  await open(page, `/poems/${poem!.id}`);
  await button(page, "أزل من المفضّلة").click();
  await expect(button(page, "أضف إلى المفضّلة")).toBeVisible();
  await openLibrary(page);
  await expect(live(page, page.getByText(/اضغط القلب في صفحة قصيدة/))).toBeVisible();
  await expect(page.getByText("القصائد المفضّلة")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("poets and reciters are kept from their pages", async ({ page }) => {
  const catalog = await catalogOf(page);
  const [poem] = catalog.poems;
  const poet = catalog.poets[poem!.poet]!.name;
  const reciterId = poem!.recitations[0]!.reciter;
  const reciter = catalog.reciters[reciterId]!.name;
  await open(page, `/poets/${poem!.poet}`);
  await button(page, "أضف إلى المفضّلة").click();
  await expect(button(page, "أزل من المفضّلة")).toBeVisible();
  await open(page, `/reciters/${reciterId}`);
  await button(page, "أضف إلى المفضّلة").click();
  await expect(button(page, "أزل من المفضّلة")).toBeVisible();

  await openLibrary(page);
  await expect(live(page, page.getByText("الشعراء المفضّلون"))).toBeVisible();
  await expect(live(page, page.getByText("المُلقون المفضّلون"))).toBeVisible();
  await expect(live(page, page.getByRole("link", { name: new RegExp(poet) }))).toBeVisible();
  await expect(live(page, page.getByRole("link", { name: new RegExp(reciter) }))).toBeVisible();
});

test("a playlist is made from a poem's page, reordered, renamed, played and deleted", async ({ page }) => {
  const errors = watchErrors(page);
  const [a, b] = (await catalogOf(page)).poems;

  // Made from the first poem's page, with it in it.
  await open(page, `/poems/${a!.id}`);
  await button(page, "أضف إلى قائمة").click();
  await live(page, page.getByRole("menuitem", { name: "قائمة جديدة" })).click();
  await live(page, page.getByRole("textbox", { name: "اسم القائمة" })).fill("  قصائد   المساء ");
  await button(page, "أنشئ").click();

  // The second poem joins it from the menu, which ticks it.
  await open(page, `/poems/${b!.id}`);
  await button(page, "أضف إلى قائمة").click();
  const entry = live(page, page.getByRole("menuitem", { name: "قصائد المساء" }));
  await entry.click();
  await expect(entry).toHaveAttribute("aria-checked", "true");
  await closeMenu(page);

  await openLibrary(page);
  await live(page, page.getByRole("link", { name: /قصائد المساء/ })).click();
  await expect(page).toHaveURL(/\/playlist\?id=/);
  const order = async () => {
    const first = await titled(page, a!.title).boundingBox();
    const second = await titled(page, b!.title).boundingBox();
    return first && second ? (first.y < second.y ? "ab" : "ba") : null;
  };
  await expect.poll(order).toBe("ab");

  // Reordered: the second poem moves up.
  await button(page, "رتّب").click();
  await live(page, page.getByRole("button", { name: "انقل إلى أعلى" }).nth(1)).click();
  await button(page, "تمّ").click();
  await expect.poll(order).toBe("ba");

  // Renamed.
  await button(page, "غيّر الاسم").click();
  await live(page, page.getByRole("textbox", { name: "اسم القائمة" })).fill("ليل");
  await button(page, "احفظ").click();
  await expect(live(page, page.getByRole("heading", { name: "ليل" }).or(page.getByText("ليل", { exact: true })))).toBeVisible();

  // Played from its first poem: the mini player shows it.
  await button(page, "شغّل الكل").click();
  await expect(live(page, page.getByRole("button", { name: "إيقاف مؤقت" }))).toBeVisible();
  await expect(titled(page, b!.title)).toBeVisible();

  // Deleted, after asking: back in the library, it's gone.
  await button(page, "احذف القائمة").click();
  await expect(live(page, page.getByText(/أتحذف قائمة «ليل»/))).toBeVisible();
  await button(page, "احذف").click();
  await expect(page).not.toHaveURL(/\/playlist/);
  await openLibrary(page);
  await expect(page.getByRole("link", { name: /ليل/ })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("a playlist the browser doesn't have says so", async ({ page }) => {
  await open(page, "/playlist?id=nothing-here");
  await expect(live(page, page.getByText("لم نجد هذه القائمة على هذا الجهاز."))).toBeVisible();
});

test("the web has no downloads, and keeps the library out of search engines", async ({ page }) => {
  const [poem] = (await catalogOf(page)).poems;
  await open(page, `/poems/${poem!.id}`);
  await expect(page.getByRole("button", { name: "نزّل للاستماع دون اتصال" })).toHaveCount(0);
  await open(page, "/library");
  await expect(page.getByText("التنزيلات")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
