// About Shawared, the privacy policy, the terms of use and contact & support, which the stores
// link as the apps' privacy policy and support page: reached from the home page on phones and
// from the header on wide windows, in both languages, each ending with links to the others.
import { expect, test, type Page } from "@playwright/test";

const CONTACT = "easybooksdev@gmail.com";
const ISSUES = "https://github.com/ieasybooks/shawared/issues";

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

/** What is on the current screen: screens you left stay mounted behind it, inert. */
const live = (page: Page, name: string, role: "link" | "heading" = "link") =>
  page.getByRole(role, { name, exact: true }).and(page.locator(":not([inert]):not([inert] *)")).filter({ visible: true }).first();

const TEXTS = {
  ar: {
    home: "/",
    about: "عن شوارد",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    support: "التواصل والدعم",
    updated: /^آخر تحديث: [٠-٩]+ [^ ]+ [٠-٩]{4}$/,
    telegram: "تيليجرام",
    issue: "فتح بلاغ على GitHub",
    rights: "«المحتوى والحقوق»",
    termsInline: "شروط الاستخدام",
  },
  en: {
    home: "/en",
    about: "About Shawared",
    privacy: "Privacy policy",
    terms: "Terms of use",
    support: "Contact & support",
    updated: /^Last updated: \d+ \w+ \d{4}$/,
    telegram: "Telegram",
    issue: "open an issue on GitHub",
    rights: "“Content and rights”",
    termsInline: "the terms of use",
  },
} as const;

for (const lang of ["ar", "en"] as const) {
  const x = TEXTS[lang];
  const prefix = lang === "en" ? "/en" : "";

  test(`home leads to About, and on through the privacy policy, the terms and support (${lang})`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(x.home);
    await live(page, x.about).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/about$`));
    await expect(live(page, x.about, "heading")).toBeVisible();
    // EasyBooks' accounts, as links in the text.
    await expect(live(page, x.telegram)).toHaveAttribute("href", "https://t.me/ieasybooks");

    await live(page, x.privacy).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/privacy$`));
    await expect(live(page, x.privacy, "heading")).toBeVisible();
    await expect(page.getByText(x.updated).filter({ visible: true })).toBeVisible();
    // Our address, as a link in the text that writes to it.
    await expect(live(page, CONTACT)).toHaveAttribute("href", `mailto:${CONTACT}`);

    await live(page, x.terms).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/terms$`));
    await expect(live(page, x.terms, "heading")).toBeVisible();
    await expect(page.getByText(x.updated).filter({ visible: true })).toBeVisible();
    await expect(live(page, CONTACT)).toHaveAttribute("href", `mailto:${CONTACT}`);

    await live(page, x.support).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/support$`));
    await expect(live(page, x.support, "heading")).toBeVisible();
    await expect(live(page, CONTACT)).toHaveAttribute("href", `mailto:${CONTACT}`);
    await expect(live(page, x.issue)).toHaveAttribute("href", ISSUES);
    // A link in the text to another page keeps the language.
    await page
      .locator("[dir='auto']", { hasText: x.rights })
      .getByRole("link", { name: x.termsInline, exact: true })
      .filter({ visible: true })
      .first()
      .click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/terms$`));
    await expect(live(page, x.terms, "heading")).toBeVisible();
    expect(errors).toEqual([]);
  });

  // Phones have no sidebar: there the links are the page's own.
  test(`each page ends with links to the other three (${lang})`, async ({ page }) => {
    const pages = { about: x.about, privacy: x.privacy, terms: x.terms, support: x.support };
    for (const path of Object.keys(pages)) {
      await page.goto(`${prefix}/${path}`);
      for (const [other, label] of Object.entries(pages).filter(([p]) => p !== path))
        await expect(live(page, label), `${path} → ${other}`).toHaveAttribute("href", `${prefix}/${other}`);
    }
  });
}

test("each page is rendered ahead of time, in its language, with its title and description", async ({ request }) => {
  for (const [path, title, description, contact] of [
    ["/about", "<title>عن شوارد</title>", "من الكتب المُيسّرة", false],
    ["/privacy", "<title>سياسة الخصوصية · شوارد</title>", "shawared.com", true],
    ["/terms", "<title>شروط الاستخدام · شوارد</title>", "shawared.com", true],
    ["/support", "<title>التواصل والدعم · شوارد</title>", "فريق شوارد", true],
    ["/en/about", "<title>About Shawared</title>", "By EasyBooks", false],
    ["/en/privacy", "<title>Privacy policy · Shawared</title>", "shawared.com", true],
    ["/en/terms", "<title>Terms of use · Shawared</title>", "shawared.com", true],
    ["/en/support", "<title>Contact &amp; support · Shawared</title>", "Shawared team", true],
  ] as const) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html, path).toContain(title);
    expect(html, path).toContain(`<link rel="canonical" href="https://shawared.com${path}"`);
    expect(html.match(/<meta name="description" content="([^"]*)"/)?.[1], path).toContain(description);
    // The page itself is in the page, for a reviewer or a crawler that runs no script, its
    // links in its text.
    if (contact) expect(html, path).toContain(`href="mailto:${CONTACT}"`);
    else expect(html, path).toContain(`href="https://t.me/ieasybooks"`);
  }
});
