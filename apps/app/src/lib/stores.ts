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
