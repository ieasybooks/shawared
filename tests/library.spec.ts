// The library around the poems: tabs, search, poets, reciters, meters, the mini player,
// links to one bayt, English addresses, and pages rendered ahead of time.
import { expect, test, type Locator, type Page } from "@playwright/test";
import type { Catalog } from "@shawared/contracts";
import { poemsCount } from "../apps/app/src/lib/i18n";
import { scrollToRow } from "./scroll-to-row";

const POEM = "/poems/taqulu-buthaynatu";
const TITLE = "تَقولُ بُثَينَةُ لَمّا رَأَت";
/** A search no poem, poet or reciter answers, however the library grows. */
const NO_MATCH = "ظظظظ";
const panelTitle = (page: Page) => page.getByText(/^البيت [٠-٩]+ · الشرح$/).first();
const slider = (page: Page) => page.getByRole("slider").first();

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

/** What is on the current screen: screens you left stay mounted behind it, inert. */
const live = (page: Page, locator: Locator) => locator.and(page.locator(":not([inert]):not([inert] *)")).filter({ visible: true }).first();
const shown = (page: Page, text: string, exact = false) => live(page, page.getByText(text, { exact }));

/** A section of the app: a tab on phones, a link in the header's navigation on wide windows. */
const section = (page: Page, name: string) =>
  live(page, page.getByRole("tab", { name, exact: true }).or(page.getByRole("navigation").getByRole("link", { name, exact: true })));

async function expectCurrent(page: Page, name: string) {
  const el = section(page, name);
  await expect
    .poll(async () => (await el.getAttribute("aria-selected")) === "true" || (await el.getAttribute("aria-current")) === "page")
    .toBe(true);
}

/** Leaves the poem inside the app: the header on wide windows, back on phones. */
async function leavePoem(page: Page) {
  await live(
    page,
    page
      .getByRole("tab", { name: "الشعراء" })
      .or(page.getByRole("navigation").getByRole("link", { name: "الشعراء" }))
      .or(page.getByRole("button", { name: "رجوع" })),
  ).click();
  await expect(page).not.toHaveURL(new RegExp(`${POEM}$`));
}

test("every kind of page wakes up without errors", async ({ page }) => {
  const errors = watchErrors(page);
  for (const path of [
    "/",
    "/poets",
    "/reciters",
    "/themes",
    "/themes/ritha",
    "/rhymes",
    "/rhymes/ra",
    "/meters",
    "/poets/jamil-buthayna",
    "/reciters/osama-alwaaedh",
    "/meters/mutaqarib",
    "/library",
    "/playlist?id=none",
    POEM,
    "/en",
    `/en${POEM}`,
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).not.toHaveAttribute("data-wait");
  }
  expect(errors).toEqual([]);
});

test("the tabs lead to poets, reciters and themes", async ({ page }) => {
  await page.goto("/");
  await expectCurrent(page, "الرئيسية");
  await section(page, "الشعراء").click();
  await expect(page).toHaveURL(/\/poets$/);
  await expectCurrent(page, "الشعراء");
  // The library has many poets: scroll to this one.
  await expect(await scrollToRow(page, "جَميل بُثَينة")).toBeVisible();
  await section(page, "المُلقون").click();
  await expect(page).toHaveURL(/\/reciters$/);
  await expect(shown(page, "أسامة الواعظ")).toBeVisible();
  await section(page, "الأغراض").click();
  await expect(page).toHaveURL(/\/themes$/);
  await expectCurrent(page, "الأغراض");
  await expect(shown(page, "الرثاء", true)).toBeVisible();
  await section(page, "الرئيسية").click();
  await expect(page).toHaveURL(/\/$/);
  // The library lists many poems, newest first: scroll to this one.
  await expect(await scrollToRow(page, TITLE)).toBeVisible();
});

test("a card's opening bayt is set at the poem's measure", async ({ page }) => {
  await page.goto("/");
  // Cards are drawn as they come on screen.
  await scrollToRow(page, TITLE);
  const halves = () =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("div")]
        .filter((d) => d.style.width && getComputedStyle(d).justifyContent === "space-between" && !d.closest("[inert]"))
        .map((d) => ({ width: Math.round(d.getBoundingClientRect().width), text: d.textContent ?? "" })),
    );
  // Every card shows two halves; a poem's pair share its measure.
  await expect.poll(async () => (await halves()).length).toBeGreaterThanOrEqual(4);
  const all = await halves();
  const plain = (t: string) => t.replace(/ـ/g, "");
  // Shown with kashida; the words are the poem's own.
  const at = all.findIndex((h) => plain(h.text) === "تَقولُبُثَينَةُلَمّارَأَت");
  expect(at).toBeGreaterThanOrEqual(0);
  const [sadr, ajuz] = [all[at]!, all[at + 1]!];
  expect(sadr.width).toBe(157);
  expect(ajuz.width).toBe(157);
  for (let i = 0; i < all.length; i += 2) expect(all[i]!.width, plain(all[i]!.text)).toBe(all[i + 1]!.width);
});

test("search finds a poem by title, opening bayt, poet or reciter, with or without harakat", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const search = page.getByRole("textbox", { name: "ابحث بعنوان أو مطلع قصيدة أو شاعر أو مُلقٍ" });
  const nothing = page.getByText("لا نتائج تطابق بحثك");
  await search.fill("الواعظ");
  await expect
    .poll(async () => {
      const [field, listen, actions] = await Promise.all([
        search.locator("..").boundingBox(),
        page
          .getByRole("button", { name: /^استمع:/ })
          .first()
          .boundingBox(),
        page.locator('a[href^="/poems/"]').first().locator(":scope > div").first().boundingBox(),
      ]);
      return field && listen && actions ? [listen.y - field.y - field.height, actions.y - listen.y] : [];
    })
    .toEqual([12, 0]);
  for (const q of ["بثينه لما رات", "فنونا من الشعر", "جميل", "Jamil", "الواعظ", "Al-Waaedh"]) {
    await search.fill(q);
    await expect(nothing, q).toHaveCount(0);
    // Other poems can match too, and come first.
    await expect(await scrollToRow(page, TITLE), q).toBeVisible();
  }
  for (const q of ["لعينيك", "المتنبي", "al-Mutanabbi"]) {
    await search.fill(q);
    await expect(page.getByText("لِعَينَيكِ ما يَلقى الفُؤادُ وَما لَقي").first(), q).toBeVisible();
    await expect(page.getByText(TITLE), q).toHaveCount(0);
  }
  await search.fill(NO_MATCH);
  await expect(nothing).toBeVisible();
  await page.getByRole("button", { name: "امسح البحث" }).click();
  await expect(search).toHaveValue("");
  await expect(await scrollToRow(page, TITLE)).toBeVisible();
});

test("search fields start where the language reads from", async ({ page }) => {
  // Polled: the page's list is swapped for the virtual one as it wakes up.
  const align = () => live(page, page.getByRole("textbox")).evaluate((el) => getComputedStyle(el).textAlign);
  await page.goto("/");
  await expect.poll(align).toBe("right");
  await page.goto("/en");
  await expect.poll(align).toBe("left");
});

test("the poets and reciters tabs search by name", async ({ page }) => {
  await page.goto("/poets");
  // Type once the page has woken up: a field filled before that is reset.
  await page.waitForLoadState("networkidle");
  const search = page.getByRole("textbox", { name: "ابحث عن شاعر" });
  for (const q of ["جميل", "بثينه", "Jamil"]) {
    await search.fill(q);
    await expect(shown(page, "جَميل بُثَينة"), q).toBeVisible();
  }
  await search.fill("المتنبي");
  await expect(shown(page, "المُتَنَبّي")).toBeVisible();
  await search.fill(NO_MATCH);
  await expect(shown(page, "لا نتائج تطابق بحثك")).toBeVisible();
  await page.goto("/reciters");
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox", { name: "ابحث عن مُلقٍ" }).fill("الواعظ");
  await expect(shown(page, "أسامة الواعظ")).toBeVisible();
});

test("every page has its title at the top, with back beside it on phones and above it on wide windows", async ({ page }, info) => {
  await page.goto("/poets");
  await expect(live(page, page.getByRole("heading", { name: "الشعراء" }))).toBeVisible();
  for (const [path, title] of [
    ["/poets/jamil-buthayna", "جَميل بُثَينة"],
    ["/reciters/osama-alwaaedh", "أسامة الواعظ"],
    ["/meters/mutaqarib", "المتقارب"],
  ] as const) {
    await page.goto(path);
    const heading = live(page, page.getByRole("heading", { name: title, exact: true }));
    const back = live(page, page.getByRole("button", { name: "رجوع" }));
    await expect(heading).toBeVisible();
    const [h, b] = [(await heading.boundingBox())!, (await back.boundingBox())!];
    if (info.project.name === "phone")
      // One row: back and the title share a middle line.
      expect(Math.abs(h.y + h.height / 2 - (b.y + b.height / 2)), path).toBeLessThan(8);
    // Wide windows: back in the toolbar over the page, the title under it, both at the start.
    else expect(b.y + b.height, path).toBeLessThanOrEqual(h.y + 1);
  }
});

test("moving to another page never shows an empty screen", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Each frame: does the screen in front show text, or the loading spinner?
  await page.evaluate(() => {
    const w = window as unknown as { emptyFrames: number };
    w.emptyFrames = 0;
    const front = (el: Element | null) => !!el && !el.closest("[inert]");
    const tick = () => {
      const texts = [...document.querySelectorAll("#root *")].filter(
        (e) =>
          front(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && (e as HTMLElement).offsetParent !== null,
      ).length;
      const spinner = [...document.querySelectorAll('[role="progressbar"]')].some((e) => front(e));
      if (texts < 2 && !spinner) w.emptyFrames++;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  // Expo fetching a page's code or its loader data held the whole page back, showing nothing.
  const fetched: string[] = [];
  page.on("request", (r) => {
    const path = new URL(r.url()).pathname;
    if (path.startsWith("/_expo/")) fetched.push(path);
  });
  await (await scrollToRow(page, TITLE)).click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
  await expect(live(page, page.getByRole("slider"))).toBeVisible();
  await live(page, page.getByRole("link", { name: /جَميل بُثَينة/ })).click();
  await expect(page).toHaveURL(/\/poets\/jamil-buthayna$/);
  await expect(shown(page, "جَميل بن عبد الله بن مَعمَر العُذْري")).toBeVisible();
  expect(fetched).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { emptyFrames: number }).emptyFrames)).toBe(0);
});

test("back retraces the reader's steps", async ({ page }) => {
  await page.goto("/");
  await (await scrollToRow(page, TITLE)).click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
  await live(page, page.getByRole("link", { name: /جَميل بُثَينة/ })).click();
  await expect(page).toHaveURL(/\/poets\/jamil-buthayna$/);
  await live(page, page.getByRole("button", { name: "رجوع" })).click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
  await live(page, page.getByRole("button", { name: "رجوع" })).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/");
});

test("a poet's page tells who they were and lists their poems", async ({ page }) => {
  await page.goto("/poets");
  await (await scrollToRow(page, "جَميل بُثَينة")).click();
  await expect(page).toHaveURL(/\/poets\/jamil-buthayna$/);
  await expect(page.getByText("جَميل بن عبد الله بن مَعمَر العُذْري")).toBeVisible();
  await page.getByText(TITLE).first().click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
});

test("Back restores a poet's row in a scrolled list", async ({ page }) => {
  await page.goto("/en/poets");
  const poet = await scrollToRow(page, "Zuhayr ibn Abi Sulma");
  await poet.click();
  await expect(page).toHaveURL(/\/en\/poets\/zuhayr-ibn-abi-sulma$/);
  await live(page, page.getByRole("button", { name: "Back", exact: true })).click();
  await expect(page).toHaveURL(/\/en\/poets$/);
  await expect(poet).toBeInViewport();
});

test("a reciter's page links to their channel and lists their poems", async ({ page }) => {
  await page.goto("/reciters/osama-alwaaedh");
  await expect(page.getByText("أسامة مصطفى الواعظ")).toBeVisible();
  await expect(page.getByRole("button", { name: "يوتيوب" })).toBeVisible();
  await (await scrollToRow(page, TITLE)).click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
});

test("a meter's page shows its feet and its poems", async ({ page }) => {
  await page.goto("/meters");
  // The list is sorted by poem count.
  await (await scrollToRow(page, "المتقارب")).click();
  await expect(page).toHaveURL(/\/meters\/mutaqarib$/);
  await expect(shown(page, "فَعولُنْ فَعولُنْ فَعولُنْ فَعولُنْ")).toBeVisible();
  const catalog: Catalog = await (await page.request.get("/content/v1/catalog.json")).json();
  const count = catalog.poems.filter((poem) => poem.meter === "mutaqarib").length;
  await expect(shown(page, poemsCount(count, "ar"), true)).toBeVisible();
  await expect(await scrollToRow(page, TITLE)).toBeVisible();
});

test("the mini player keeps the recitation going between pages", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(POEM);
  await page.getByRole("button", { name: "تشغيل", exact: true }).click();
  await expect(page.getByRole("button", { name: "إيقاف مؤقت" }).first()).toBeVisible();
  await leavePoem(page);
  const mini = page.getByRole("link", { name: TITLE, exact: true });
  await expect(mini).toBeVisible();
  // Still playing: the button offers pause, and pauses.
  await page.getByRole("button", { name: "إيقاف مؤقت" }).click();
  await expect(page.getByRole("button", { name: "تشغيل", exact: true }).last()).toBeVisible();
  await mini.click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
  expect(errors).toEqual([]);
});

test("pages outside the tabs carry the mini player, and closing it stops the recitation", async ({ page }) => {
  await page.goto(POEM);
  await page.getByRole("button", { name: "تشغيل", exact: true }).click();
  await live(page, page.getByRole("link", { name: /جَميل بُثَينة/ })).click();
  await expect(page).toHaveURL(/\/poets\/jamil-buthayna$/);
  const mini = live(page, page.getByRole("link", { name: TITLE, exact: true }));
  await expect(mini).toBeVisible();
  await live(page, page.getByRole("button", { name: "أغلق المشغّل" })).click();
  await expect(page.getByRole("button", { name: "أغلق المشغّل" })).toHaveCount(0);
  // Back on the poem, nothing is playing.
  await live(page, page.getByRole("button", { name: "رجوع" })).click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
  await expect(page.getByRole("button", { name: "تشغيل", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "إيقاف مؤقت" })).toHaveCount(0);
});

test("a link to one bayt holds it, ready to play from there", async ({ page }) => {
  await page.goto(`${POEM}?b=7`);
  await expect(panelTitle(page)).toHaveText("البيت ٧ · الشرح");
  // Waiting at the bayt's run-up, the player already names it.
  await expect(
    page
      .getByText(/البيت ٧ من ١٠/)
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "تشغيل", exact: true }).click();
  // Bayt 7 starts at 39 s.
  await expect.poll(async () => Number(await slider(page).getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(38);
  expect(Number(await slider(page).getAttribute("aria-valuenow"))).toBeLessThan(48);
});

test("English pages live under /en, and switching language keeps the page", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await section(page, "Poets").click();
  await expect(page).toHaveURL(/\/en\/poets$/);
  await (await scrollToRow(page, "Jamil Buthayna")).click();
  await expect(page).toHaveURL(/\/en\/poets\/jamil-buthayna$/);
  await live(page, page.getByRole("button", { name: "Language" })).click();
  await page.getByRole("menuitem", { name: "العربية" }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/poets/jamil-buthayna");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(shown(page, "ت ٨٢هـ")).toBeVisible();
});

test("the night theme is there from the first paint", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("shawared.settings.v1", JSON.stringify({ lang: "ar", theme: "night" })));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(18, 21, 31)");
  await expect(page.getByRole("button", { name: "المظهر النهاري" })).toBeVisible();
});

test("pages arrive rendered, with what search engines read", async ({ request }) => {
  const poem = await (await request.get(POEM)).text();
  expect(poem).toContain('<html lang="ar" dir="rtl"');
  expect(poem).toContain("وَأَنتِ كَلُؤلُؤَةِ المَرزَبانِ");
  expect(poem).toContain(`<title>${TITLE} · جَميل بُثَينة · شوارد</title>`);
  expect(poem).toContain('<link rel="canonical" href="https://shawared.com/poems/taqulu-buthaynatu"/>');
  expect(poem).toContain('<link rel="alternate" href="https://shawared.com/en/poems/taqulu-buthaynatu" hreflang="en"/>');
  expect(poem).toContain('<meta property="og:audio"');

  const en = await (await request.get(`/en${POEM}`)).text();
  expect(en).toContain('<html lang="en" dir="ltr"');
  expect(en).toContain("Jamil Buthayna · Shawared</title>");

  // The home page arrives with its first cards, the newest poems.
  const catalog = (await (await request.get("/content/v1/catalog.json")).json()) as { poems: { title: string }[] };
  const home = await (await request.get("/")).text();
  expect(home).toContain(catalog.poems[0]!.title);
  const meters = await (await request.get("/meters")).text();
  expect(meters).toContain("الطويل");
  expect(meters).toContain("المتدارك");
});
