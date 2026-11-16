// The library around the poems: tabs, search, poets, reciters, meters, the mini player,
// links to one bayt, English addresses, and pages rendered ahead of time.
import { expect, test, type Locator, type Page } from "@playwright/test";

const POEM = "/poems/taqulu-buthaynatu";
const TITLE = "تَقولُ بُثَينَةُ لَمّا رَأَت";
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

/** Scrolls a virtual list until a row is drawn and on screen. */
async function scrollTo(page: Page, text: string) {
  const row = shown(page, text, true);
  const onScreen = async () => {
    if (!(await row.count())) return false;
    const box = await row.boundingBox();
    return !!box && box.y >= 0 && box.y + box.height <= (page.viewportSize()?.height ?? 0);
  };
  await page.waitForLoadState("networkidle");
  for (let i = 0; i < 12 && !(await onScreen()); i++) {
    // Scroll the current screen's scrolling boxes (touch emulation ignores the mouse wheel).
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("div")) {
        const o = getComputedStyle(el).overflowY;
        if ((o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight && !el.closest("[inert]")) el.scrollBy(0, 400);
      }
    });
    await page.waitForTimeout(150);
  }
  return row;
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
    "/meters",
    "/poets/jamil-buthayna",
    "/reciters/osama-alwaaedh",
    "/meters/mutaqarib",
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

test("the tabs lead to poets, reciters and meters", async ({ page }) => {
  await page.goto("/");
  await expectCurrent(page, "الرئيسية");
  await section(page, "الشعراء").click();
  await expect(page).toHaveURL(/\/poets$/);
  await expectCurrent(page, "الشعراء");
  await expect(shown(page, "جَميل بُثَينة")).toBeVisible();
  await section(page, "المُلقون").click();
  await expect(page).toHaveURL(/\/reciters$/);
  await expect(shown(page, "أسامة الواعظ")).toBeVisible();
  await section(page, "البحور").click();
  await expect(page).toHaveURL(/\/meters$/);
  await expect(shown(page, "الطويل", true)).toBeVisible();
  await expect(shown(page, "فَعولُنْ مَفاعيلُنْ فَعولُنْ مَفاعيلُنْ")).toBeVisible();
  await section(page, "الرئيسية").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(shown(page, TITLE)).toBeVisible();
});

test("a card's opening bayt is set at the poem's measure", async ({ page }) => {
  await page.goto("/");
  const halves = () =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("div")]
        .filter((d) => d.style.width && getComputedStyle(d).justifyContent === "space-between" && !d.closest("[inert]"))
        .map((d) => ({ width: Math.round(d.getBoundingClientRect().width), text: d.textContent ?? "" })),
    );
  await expect.poll(async () => (await halves()).length).toBe(2);
  const [sadr, ajuz] = await halves();
  expect(sadr!.width).toBe(157);
  expect(ajuz!.width).toBe(157);
  // Shown with kashida; the words are the poem's own.
  expect(sadr!.text.replace(/ـ/g, "")).toBe("تَقولُبُثَينَةُلَمّارَأَت");
});

test("search finds a poem by title, opening bayt, poet or reciter, with or without harakat", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("textbox", { name: "ابحث بعنوان أو مطلع قصيدة أو شاعر أو مُلقٍ" });
  const nothing = page.getByText("لا نتائج تطابق بحثك");
  for (const q of ["بثينه لما رات", "فنونا من الشعر", "جميل", "Jamil", "الواعظ", "Al-Waaedh"]) {
    await search.fill(q);
    await expect(nothing, q).toHaveCount(0);
    await expect(page.getByText(TITLE).first(), q).toBeVisible();
  }
  await search.fill("المتنبي");
  await expect(nothing).toBeVisible();
  await page.getByRole("button", { name: "امسح البحث" }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByText(TITLE).first()).toBeVisible();
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
  const search = page.getByRole("textbox", { name: "ابحث عن شاعر" });
  for (const q of ["جميل", "بثينه", "Jamil"]) {
    await search.fill(q);
    await expect(shown(page, "جَميل بُثَينة"), q).toBeVisible();
  }
  await search.fill("المتنبي");
  await expect(shown(page, "لا نتائج تطابق بحثك")).toBeVisible();
  await page.goto("/reciters");
  await page.getByRole("textbox", { name: "ابحث عن مُلقٍ" }).fill("الواعظ");
  await expect(shown(page, "أسامة الواعظ")).toBeVisible();
});

test("every page has its title at the top, with back beside it on pages opened from another", async ({ page }) => {
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
    // One row: back and the title share a middle line.
    expect(Math.abs(h.y + h.height / 2 - (b.y + b.height / 2)), path).toBeLessThan(8);
  }
});

test("back retraces the reader's steps", async ({ page }) => {
  await page.goto("/");
  await shown(page, TITLE).click();
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
  await page.getByText("جَميل بُثَينة").first().click();
  await expect(page).toHaveURL(/\/poets\/jamil-buthayna$/);
  await expect(page.getByText("جَميل بن عبد الله بن مَعمَر العُذْري")).toBeVisible();
  await page.getByText(TITLE).first().click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
});

test("a reciter's page links to their channel and lists their poems", async ({ page }) => {
  await page.goto("/reciters/osama-alwaaedh");
  await expect(page.getByText("أسامة مصطفى الواعظ")).toBeVisible();
  await expect(page.getByRole("button", { name: "يوتيوب" })).toBeVisible();
  await page.getByText(TITLE).first().click();
  await expect(page).toHaveURL(new RegExp(`${POEM}$`));
});

test("a meter's page shows its feet and its poems", async ({ page }) => {
  await page.goto("/meters");
  // The fifteenth of sixteen: below the fold.
  await (await scrollTo(page, "المتقارب")).click();
  await expect(page).toHaveURL(/\/meters\/mutaqarib$/);
  await expect(shown(page, "فَعولُنْ فَعولُنْ فَعولُنْ فَعولُنْ")).toBeVisible();
  await expect(shown(page, "قصيدة واحدة")).toBeVisible();
  await expect(shown(page, TITLE)).toBeVisible();
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
  await expect(page.getByText(/البيت ٧ من ١٠/).first()).toBeVisible();
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
  await shown(page, "Jamil Buthayna").click();
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
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(19, 26, 46)");
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

  const home = await (await request.get("/")).text();
  expect(home).toContain(TITLE);
  const meters = await (await request.get("/meters")).text();
  expect(meters).toContain("الطويل");
  expect(meters).toContain("المتدارك");
});
