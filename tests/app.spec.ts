// shawared.com/app, the one address to share for the apps: a phone goes on to its store as the
// page loads (apps/app/src/lib/stores.ts), and a computer, or a phone whose store we can't
// tell, gets the page: the three stores' badges, and on wide windows a QR code of the page.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const STORES = {
  appStore: "https://apps.apple.com/app/id6836290037",
  googlePlay: "https://play.google.com/store/apps/details?id=com.shawared.app",
  appGallery: "https://appgallery.huawei.com/app/C119866441",
};
const STORE_HOSTS = /^https:\/\/(apps\.apple\.com|play\.google\.com|appgallery\.huawei\.com)\//;
const JSQR = createRequire(import.meta.url).resolve("jsqr/dist/jsQR.js");

const UA = {
  iPhone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  // An iPad's Safari asks for the desktop site, as a Mac.
  iPad: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  android: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36",
  huawei:
    "Mozilla/5.0 (Linux; Android 10; NOH-NX9; HMSCore 6.15.0.302) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.196 HuaweiBrowser/15.0.4.312 Mobile Safari/537.36",
  harmonyNext:
    "Mozilla/5.0 (Phone; OpenHarmony 6.0; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 ArkWeb/6.0.0.130 Mobile HuaweiBrowser/5.1.12.351",
};

const TEXTS = {
  ar: {
    title: "تطبيق شوارد",
    badges: {
      appStore: "تنزيل شوارد من App Store",
      googlePlay: "تنزيل شوارد من Google Play",
      appGallery: "تنزيل شوارد من HUAWEI AppGallery",
    },
    qr: "رمز QR لصفحة تطبيق شوارد",
  },
  en: {
    title: "The Shawared app",
    badges: {
      appStore: "Download Shawared on the App Store",
      googlePlay: "Get Shawared on Google Play",
      appGallery: "Get Shawared from HUAWEI AppGallery",
    },
    qr: "QR code for the Shawared app page",
  },
} as const;

const at = (lang: "ar" | "en") => (lang === "en" ? "/en/app" : "/app");

/** Answers for the stores, so a test never leaves for them. */
async function standInForStores(page: Page) {
  await page.context().route(STORE_HOSTS, (route) => route.fulfill({ contentType: "text/html", body: "<title>store</title>" }));
}

/** Opens the page and waits for the app to take it over. */
async function open(page: Page, path: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  return errors;
}

/** What a QR code on the page says, read from what the browser drew. */
async function readQr(page: Page, name: string): Promise<string | null> {
  const png = (await page.getByRole("img", { name }).screenshot()).toString("base64");
  await page.addScriptTag({ path: JSQR });
  return page.evaluate(async (src) => {
    const img = new Image();
    img.src = `data:image/png;base64,${src}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(img, 0, 0);
    const { data, width, height } = context.getImageData(0, 0, img.width, img.height);
    type Read = (d: Uint8ClampedArray, w: number, h: number) => { data: string } | null;
    return (window as unknown as { jsQR: Read }).jsQR(data, width, height)?.data ?? null;
  }, png);
}

for (const [device, ua, store, touchPoints] of [
  ["an iPhone", UA.iPhone, "appStore", 5],
  ["an iPad", UA.iPad, "appStore", 5],
  ["an Android phone", UA.android, "googlePlay", 5],
  ["a Huawei phone", UA.huawei, "appGallery", 10],
] as const) {
  test.describe(`${device} goes on to its store`, () => {
    test.skip(({ isMobile }) => !isMobile, "phones");
    test.use({ userAgent: ua });

    for (const lang of ["ar", "en"] as const) {
      test(lang, async ({ page }) => {
        // A real device's count: Chromium's touch emulation reports one.
        await page.addInitScript((n) => Object.defineProperty(Navigator.prototype, "maxTouchPoints", { get: () => n }), touchPoints);
        await standInForStores(page);
        const from = lang === "en" ? "/en/about" : "/about";
        await page.goto(from);
        await page.goto(at(lang), { waitUntil: "commit" });
        await page.waitForURL(STORES[store]);
        await expect(page).toHaveTitle("store");
        // In place of the page, so back leads to where the reader came from.
        await page.goBack();
        await expect(page).toHaveURL(new RegExp(`${from}$`));
      });
    }
  });
}

test.describe("HarmonyOS NEXT, which runs no Android apps, gets the page", () => {
  test.skip(({ isMobile }) => !isMobile, "phones");
  test.use({ userAgent: UA.harmonyNext });

  for (const lang of ["ar", "en"] as const) {
    test(lang, async ({ page }) => {
      await standInForStores(page);
      await open(page, at(lang));
      await expect(page).toHaveURL(new RegExp(`${at(lang)}$`));
      for (const store of ["appStore", "googlePlay", "appGallery"] as const)
        await expect(page.getByRole("link", { name: TEXTS[lang].badges[store], exact: true })).toHaveAttribute("href", STORES[store]);
    });
  }
});

for (const lang of ["ar", "en"] as const) {
  const x = TEXTS[lang];

  test(`a computer gets the page: the three stores, and the page's QR code on wide windows (${lang})`, async ({ page }, info) => {
    await standInForStores(page);
    const errors = await open(page, at(lang));
    await expect(page).toHaveURL(new RegExp(`${at(lang)}$`));
    await expect(page.getByText(x.title, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    for (const store of ["appStore", "googlePlay", "appGallery"] as const) {
      const badge = page.getByRole("link", { name: x.badges[store], exact: true });
      await expect(badge).toBeVisible();
      await expect(badge).toHaveAttribute("href", STORES[store]);
      await expect(badge).toHaveAttribute("target", "_blank");
      // Each opens its store in a tab of its own.
      const [tab] = await Promise.all([page.context().waitForEvent("page"), badge.click()]);
      await tab.waitForURL(STORES[store]);
      await tab.close();
    }
    await expect(page).toHaveURL(new RegExp(`${at(lang)}$`));
    if (info.project.name === "phone") {
      // A phone has no use for a code it would scan itself.
      await expect(page.getByRole("img", { name: x.qr })).toBeHidden();
    } else {
      await expect(page.getByRole("img", { name: x.qr })).toBeVisible();
      expect(await readQr(page, x.qr)).toBe(`https://shawared.com${at(lang)}`);
    }
    expect(errors).toEqual([]);
  });
}

test("the app page stays out of search engines, and other pages send no one to a store", async ({ page }) => {
  await page.goto("/app");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  // Only this page carries the redirect. (The others name the stores for the app bar's Open.)
  for (const path of ["/", "/about", "/en/about"]) {
    const html = await (await page.request.get(path)).text();
    expect(html, path).not.toContain("location.replace");
  }
});
