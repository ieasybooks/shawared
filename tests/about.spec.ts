// About Shawared and the privacy policy, which the stores link as the apps' support page and
// privacy policy: reached from the home page on phones and from the header on wide windows,
// in both languages.
import { expect, test, type Page } from "@playwright/test";

const CONTACT = "easybooksdev@gmail.com";

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

/** What is on the current screen: screens you left stay mounted behind it, inert. */
const live = (page: Page, name: string, role: "link" | "heading" = "link") =>
  page.getByRole(role, { name, exact: true }).and(page.locator(":not([inert]):not([inert] *)")).filter({ visible: true }).first();

for (const [lang, home, about, privacy, updated] of [
  ["ar", "/", "عن شوارد", "سياسة الخصوصية", /^آخر تحديث: [٠-٩]+ [^ ]+ [٠-٩]{4}$/],
  ["en", "/en", "About Shawared", "Privacy policy", /^Last updated: \d+ \w+ \d{4}$/],
] as const) {
  test(`home leads to About, and About to the privacy policy (${lang})`, async ({ page }) => {
    const errors = watchErrors(page);
    const prefix = lang === "en" ? "/en" : "";
    await page.goto(home);
    await live(page, about).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/about$`));
    await expect(live(page, about, "heading")).toBeVisible();
    // Support: our address, as a link that writes to it.
    await expect(live(page, CONTACT)).toHaveAttribute("href", `mailto:${CONTACT}`);
    await live(page, privacy).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/privacy$`));
    await expect(live(page, privacy, "heading")).toBeVisible();
    await expect(page.getByText(updated).filter({ visible: true })).toBeVisible();
    await expect(live(page, CONTACT)).toHaveAttribute("href", `mailto:${CONTACT}`);
    expect(errors).toEqual([]);
  });
}

test("each page is rendered ahead of time, in its language, with its title and description", async ({ request }) => {
  for (const [path, title, description] of [
    ["/about", "<title>عن شوارد</title>", "مبادرة الكتب المُيسّرة"],
    ["/privacy", "<title>سياسة الخصوصية · شوارد</title>", "shawared.com"],
    ["/en/about", "<title>About Shawared</title>", "EasyBooks initiative"],
    ["/en/privacy", "<title>Privacy policy · Shawared</title>", "shawared.com"],
  ] as const) {
    const html = await (await request.get(path)).text();
    expect(html, path).toContain(title);
    expect(html, path).toContain(`<link rel="canonical" href="https://shawared.com${path}"`);
    expect(html.match(/<meta name="description" content="([^"]*)"/)?.[1], path).toContain(description);
    // The policy itself is in the page, for a reviewer or a crawler that runs no script.
    expect(html, path).toContain(CONTACT);
  }
});
