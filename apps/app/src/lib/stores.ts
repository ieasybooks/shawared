// The apps in the three stores, and shawared.com/app, the one address to share for them: a
// phone goes straight on to its store, and anything else gets the page with the three badges
// (features/stores).

/** Each store's page for the apps. */
export const STORES = {
  appStore: "https://apps.apple.com/app/id6836290037",
  googlePlay: "https://play.google.com/store/apps/details?id=com.shawared.app",
  appGallery: "https://appgallery.huawei.com/app/C119866441",
} as const;

export type Store = keyof typeof STORES;

/**
 * Which store a browser's device takes its apps from, or null to show the page, from its user
 * agent and its touch points. As source, because it runs in the page's head before the app's
 * scripts (storeRedirect): old JavaScript, on its own.
 *
 * - iPhones and iPads go to the App Store. An iPad's Safari asks for the desktop site as a Mac
 *   does, but a Mac has no touch screen.
 * - Huawei's phones go to AppGallery: those sold since 2019 have no Google Play, and every
 *   Huawei phone comes with AppGallery. They browse with Huawei's browser, which names itself
 *   (HuaweiBrowser, HMSCore), and apps' web views carry the build (Build/HUAWEI…). Chrome hides
 *   the phone's maker, so a Huawei phone running Chrome goes to Google Play: most of those are
 *   older phones, which have it.
 * - Other Android phones and tablets go to Google Play.
 * - HarmonyOS NEXT (OpenHarmony) runs no Android apps, so it gets the page, though its browser
 *   says Android too.
 */
export const STORE_OF_DEVICE = `function (ua, touchPoints) {
  if (/OpenHarmony/i.test(ua)) return null;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)) return "appStore";
  if (!/Android/.test(ua)) return null;
  return /huawei|hmscore/i.test(ua) ? "appGallery" : "googlePlay";
}`;

/**
 * Sends a phone on to its store as the page starts to load. The page carries on loading
 * meanwhile, so a browser that stays on it still has the badges.
 */
export const storeRedirect = `(function () {
  var store = (${STORE_OF_DEVICE})(navigator.userAgent, navigator.maxTouchPoints || 0);
  var stores = ${JSON.stringify(STORES)};
  if (store) location.replace(stores[store]);
})();`;

/** The apps' App Store ID, which Safari's own banner takes (`apple-itunes-app`). */
export const APP_STORE_ID = /id(\d+)$/.exec(STORES.appStore)![1]!;

/** Sent when the reader leaves for the app from the app bar, so the page's player pauses. */
export const OPEN_APP_EVENT = "shawared:open-app";

// Browsers on iPhones and iPads other than Safari, apps' among them: Safari shows Apple's
// banner, they don't.
const NOT_SAFARI =
  /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|DuckDuckGo|GSA\/|FBAN|FBAV|FB_IAB|Instagram|Line\/|Snapchat|musical_ly|Bytedance|TikTok|Twitter|LinkedInApp|Pinterest|WhatsApp|Telegram/i;
// Apps' browsers on Android, which may not hand an intent:// link on to the system.
const ANDROID_IN_APP = /; wv\)|FBAN|FBAV|FB_IAB|Instagram|Line\/|Snapchat|musical_ly|Bytedance|TikTok/i;

/**
 * Where the app bar's Open takes a phone's browser at `path` (with its query), or null for no
 * bar. Each way ends in the app or its store page, which offers Open when the app is there:
 *
 * - Safari on iPhones and iPads: no bar. Apple's banner (`apple-itunes-app`) opens the app at
 *   the page, or offers it from the App Store.
 * - Other browsers on iPhones and iPads: the App Store page.
 * - Android browsers: the app at the same page, through its `shawared://` address, which every
 *   version of the app has; Google Play when the app isn't there.
 * - Apps' browsers on Android: the Google Play page.
 * - Huawei phones: the AppGallery page.
 * - Computers, and HarmonyOS NEXT, which runs no Android apps: no bar.
 */
export const APP_LINK_OF_DEVICE = `function (ua, touchPoints, path) {
  var store = (${STORE_OF_DEVICE})(ua, touchPoints);
  var stores = ${JSON.stringify(STORES)};
  if (store === "appStore") return /Safari\\//.test(ua) && !${NOT_SAFARI}.test(ua) ? null : stores.appStore;
  if (store === "appGallery") return stores.appGallery;
  if (store !== "googlePlay") return null;
  if (${ANDROID_IN_APP}.test(ua)) return stores.googlePlay;
  return "intent://" + path.replace(/^\\//, "") + "#Intent;scheme=shawared;package=com.shawared.app;S.browser_fallback_url=" + encodeURIComponent(stores.googlePlay) + ";end";
}`;

/** Safari's banner opens the app at the page the reader is on, with its query. */
export const smartBannerArgument = (site: string) => `(function () {
  var meta = document.querySelector('meta[name="apple-itunes-app"]');
  if (meta) meta.setAttribute("content", "app-id=${APP_STORE_ID}, app-argument=" + ${JSON.stringify(site)} + location.pathname + location.search);
})();`;

type BannerTexts = { name: string; text: string; open: string; close: string };

/**
 * Shows the app bar (`#app-banner`, drawn by app/+html.tsx above the app) on a phone's browser
 * that gets one, before the page is painted: it runs where the bar is in the markup, ahead of
 * the app, and `data-app-banner` on the page makes room for it. Not in an installed web app.
 * Open goes to the page the reader is at when they tap, and pauses the player (OPEN_APP_EVENT);
 * × hides the bar for the visit. Its words follow the page's language.
 */
export const appBanner = (texts: Record<"ar" | "en", BannerTexts>) => `(function () {
  var d = document.documentElement;
  var bar = document.getElementById("app-banner");
  var linkOf = ${APP_LINK_OF_DEVICE};
  var link = function () { return linkOf(navigator.userAgent, navigator.maxTouchPoints || 0, location.pathname + location.search); };
  var installed = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  if (!bar || installed || !link()) return;
  var open = bar.querySelector("a");
  var close = bar.querySelector("button");
  // Set here, not in the markup, so pages without the bar don't load it.
  bar.querySelector("img").src = "/apple-touch-icon.png";
  var texts = ${JSON.stringify(texts)};
  var words = function () {
    var t = texts[d.lang === "en" ? "en" : "ar"];
    bar.setAttribute("aria-label", t.text);
    bar.querySelector("strong").textContent = t.name;
    bar.querySelector("span").textContent = t.text;
    open.textContent = t.open;
    close.setAttribute("aria-label", t.close);
  };
  words();
  new MutationObserver(words).observe(d, { attributes: true, attributeFilter: ["lang"] });
  open.href = link();
  open.addEventListener("click", function () {
    open.href = link();
    window.dispatchEvent(new Event(${JSON.stringify(OPEN_APP_EVENT)}));
  });
  close.addEventListener("click", function () { d.removeAttribute("data-app-banner"); });
  d.setAttribute("data-app-banner", "");
})();`;
