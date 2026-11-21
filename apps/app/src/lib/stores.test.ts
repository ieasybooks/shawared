import { describe, expect, it } from "vitest";
import appJson from "../../app.json";
import storeJson from "../../store/store.json";
import { APP_LINK_OF_DEVICE, APP_STORE_ID, STORE_OF_DEVICE, STORES, storeRedirect, type Store } from "./stores";

const storeOf = new Function(`return (${STORE_OF_DEVICE})`)() as (ua: string, touchPoints: number) => Store | null;

// Real browsers' user agents, with the touch points they report.
const DEVICES: [string, string, number, Store | null][] = [
  [
    "Safari on an iPhone",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
    5,
    "appStore",
  ],
  [
    "Instagram's browser on an iPhone",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 380.0.0.29.109 (iPhone16,2; iOS 18_5; ar_SA; ar; scale=3.00; 1290x2796; 735064386)",
    5,
    "appStore",
  ],
  [
    "Safari on an iPad, which asks for the desktop site",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
    5,
    "appStore",
  ],
  [
    "Chrome on an iPad",
    "Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.77 Mobile/15E148 Safari/604.1",
    5,
    "appStore",
  ],
  [
    "Chrome on Android, which hides the phone",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36",
    5,
    "googlePlay",
  ],
  [
    "Samsung Internet",
    "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36",
    5,
    "googlePlay",
  ],
  ["Firefox on Android", "Mozilla/5.0 (Android 15; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0", 5, "googlePlay"],
  [
    "Huawei's browser on a Huawei phone",
    "Mozilla/5.0 (Linux; Android 10; NOH-NX9; HMSCore 6.15.0.302) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.196 HuaweiBrowser/15.0.4.312 Mobile Safari/537.36",
    10,
    "appGallery",
  ],
  [
    "Huawei's browser on HarmonyOS 4, which runs Android apps",
    "Mozilla/5.0 (Linux; Android 10; HarmonyOS; VOG-AL00; HMSCore 6.14.0.302; GMSCore 20.15.16) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.196 HuaweiBrowser/15.0.4.312 Mobile Safari/537.36",
    10,
    "appGallery",
  ],
  [
    "Facebook's browser on a Huawei phone",
    "Mozilla/5.0 (Linux; Android 10; ELS-NX9 Build/HUAWEIELS-N39; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.40.109;]",
    10,
    "appGallery",
  ],
  [
    "HarmonyOS NEXT, which runs no Android apps though it says Android",
    "Mozilla/5.0 (Phone; OpenHarmony 6.0; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 ArkWeb/6.0.0.130 Mobile HuaweiBrowser/5.1.12.351",
    10,
    null,
  ],
  [
    "HarmonyOS NEXT's default user agent",
    "Mozilla/5.0 (Phone; OpenHarmony 5.0; HarmonyOS 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 ArkWeb/4.1.6.1 Mobile",
    10,
    null,
  ],
  [
    "Safari on a Mac",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
    0,
    null,
  ],
  [
    "Chrome on Windows",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    0,
    null,
  ],
  ["Firefox on Linux", "Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0", 0, null],
];

describe("the store a device gets", () => {
  for (const [name, ua, touchPoints, store] of DEVICES) {
    it(`${name}: ${store ?? "the page"}`, () => expect(storeOf(ua, touchPoints)).toBe(store));
  }
});

describe("the redirect in the app page's head", () => {
  const run = (userAgent: string, maxTouchPoints: number) => {
    const went: string[] = [];
    new Function("navigator", "location", storeRedirect)({ userAgent, maxTouchPoints }, { replace: (url: string) => went.push(url) });
    return went;
  };

  it("sends a phone to its store's page for the apps, in place of the page", () => {
    for (const [name, ua, touchPoints, store] of DEVICES) expect(run(ua, touchPoints), name).toEqual(store ? [STORES[store]] : []);
  });

  it("leaves a browser that reports no touch points alone", () => {
    expect(run(DEVICES.find(([name]) => name === "Safari on a Mac")![1], undefined as unknown as number)).toEqual([]);
  });
});

describe("the stores' addresses", () => {
  it("name the apps the stores have: the package and AppGallery's app ID", () => {
    expect(STORES.googlePlay).toBe(`https://play.google.com/store/apps/details?id=${appJson.expo.android.package}`);
    expect(STORES.appGallery).toBe(`https://appgallery.huawei.com/app/C${storeJson.appGallery.appId}`);
    expect(STORES.appStore).toMatch(/^https:\/\/apps\.apple\.com\/app\/id\d+$/);
  });
});

describe("the app bar's Open on a phone's browser", () => {
  const linkOf = new Function(`return (${APP_LINK_OF_DEVICE})`)() as (ua: string, touchPoints: number, path: string) => string | null;
  const ua = (name: string) => DEVICES.find(([n]) => n === name)![1];
  const POEM = "/poems/taqulu-buthaynatu?b=3";
  const intent = (link: string) =>
    `intent://${link}#Intent;scheme=shawared;package=com.shawared.app;S.browser_fallback_url=${encodeURIComponent(STORES.googlePlay)};end`;

  it("leaves Safari on iPhones and iPads to Apple's banner, and sends other iOS browsers to the App Store", () => {
    expect(linkOf(ua("Safari on an iPhone"), 5, POEM)).toBeNull();
    expect(linkOf(ua("Safari on an iPad, which asks for the desktop site"), 5, POEM)).toBeNull();
    expect(linkOf(ua("Chrome on an iPad"), 5, POEM)).toBe(STORES.appStore);
    expect(linkOf(ua("Instagram's browser on an iPhone"), 5, POEM)).toBe(STORES.appStore);
  });

  it("opens the app at the same page from Android's browsers, or Google Play without it", () => {
    for (const name of ["Chrome on Android, which hides the phone", "Samsung Internet", "Firefox on Android"])
      expect(linkOf(ua(name), 5, POEM), name).toBe(intent("poems/taqulu-buthaynatu?b=3"));
    expect(linkOf(ua("Samsung Internet"), 5, "/")).toBe(intent(""));
    expect(linkOf(ua("Samsung Internet"), 5, "/en/poets/jamil-buthayna")).toBe(intent("en/poets/jamil-buthayna"));
  });

  it("sends apps' browsers on Android to Google Play, and Huawei phones to AppGallery", () => {
    const facebook =
      "Mozilla/5.0 (Linux; Android 14; SM-S921B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.40.109;]";
    expect(linkOf(facebook, 5, POEM)).toBe(STORES.googlePlay);
    expect(linkOf(ua("Huawei's browser on a Huawei phone"), 10, POEM)).toBe(STORES.appGallery);
    expect(linkOf(ua("Facebook's browser on a Huawei phone"), 10, POEM)).toBe(STORES.appGallery);
  });

  it("shows no bar on computers or HarmonyOS NEXT", () => {
    for (const name of ["Safari on a Mac", "Chrome on Windows", "Firefox on Linux", "HarmonyOS NEXT's default user agent"])
      expect(linkOf(ua(name), name.includes("HarmonyOS") ? 10 : 0, POEM), name).toBeNull();
  });

  it("gives Safari's banner the App Store's ID", () => {
    expect(STORES.appStore).toBe(`https://apps.apple.com/app/id${APP_STORE_ID}`);
  });
});
