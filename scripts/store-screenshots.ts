// Draws the store images in apps/app/store/screenshots from the app itself:
// six scenes in each language, at the sizes the App Store (iPhone, iPad),
// Google Play and AppGallery take, plus the stores' icons and Google Play's
// feature graphic. Run it after a change to how the app looks, and commit what
// it writes; the release sends the images to the stores.
//
//   bun run web:build:test && bun scripts/store-screenshots.ts
//
// It serves the test build as the browser tests do (wrangler dev, with silent
// stand-ins for the recordings), and drives it in Chrome. The icons need
// rsvg-convert (brew install librsvg).
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";
import { SETTINGS_KEY } from "../apps/app/src/lib/preferences.ts";
import { DAY, image } from "./app-icons.ts";
import { root } from "./repository.ts";

type Lang = "ar" | "en";
const LANGS: Lang[] = ["ar", "en"];
const SITE = "http://127.0.0.1:8787";
const POEM = "araka-asiyya-al-dami";
const POET = "al-mutanabbi";
const SAVED_KEY = "shawared.saved.v1";

// The screens each store shows, by the size it takes: an iPhone 6.9" (1320x2868), an iPad 13"
// (2064x2752), and a 9:16 phone for Google Play and AppGallery (1080x1920).
const DEVICES = {
  iphone: { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  ipad: { viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2, isMobile: false, hasTouch: true },
  // A roomier phone than 360x640 at 3x: that crowds the poem out from under its player.
  phone: { viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true },
} as const;
type Device = keyof typeof DEVICES;

const at = (lang: Lang, path: string) => (lang === "en" ? (path === "/" ? "/en" : `/en${path}`) : path);
// Verse words may be drawn with kashida: find them with tatweel allowed between letters.
const word = (w: string) => new RegExp(`^${[...w].join("ـ*")}$`);

/** The poem's first note on a single word in a language, as the page shows it. */
function firstNote(lang: Lang): string {
  const bundle = JSON.parse(readFileSync(join(root(), `apps/app/public/content/v1/poems/${POEM}/${lang}.json`), "utf8")) as {
    sources: { words?: Record<string, { word: string }> }[];
  };
  const order = (address: string) => address.split(".").map(Number);
  const notes = Object.entries(bundle.sources[0]?.words ?? {})
    .filter(([address]) => !address.includes("-"))
    .sort(([a], [b]) => {
      const [x, y] = [order(a), order(b)];
      return x[0]! - y[0]! || x[1]! - y[1]! || x[2]! - y[2]!;
    });
  if (!notes.length) throw new Error(`${POEM} has no notes on single words in ${lang}`);
  return notes[0]![1].word;
}

async function settle(page: Page, ms = 900) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(ms);
}

/** The scenes, in the order the stores show them. */
const SCENES: {
  name: string;
  night?: boolean;
  /** What the reader has saved (favourites, playlists), as lib/saved.ts stores it. */
  saved?: (lang: Lang) => object;
  show: (page: Page, lang: Lang) => Promise<void>;
}[] = [
  {
    name: "01-library",
    show: async (page, lang) => {
      await page.goto(SITE + at(lang, "/"));
      await settle(page);
    },
  },
  {
    name: "02-listening",
    show: async (page, lang) => {
      await page.goto(SITE + at(lang, `/poems/${POEM}`));
      await settle(page);
      await page.getByRole("button", { name: lang === "ar" ? "شغّل من البيت ٢" : "Play from verse 2", exact: true }).click();
      await settle(page, 1500);
    },
  },
  {
    name: "03-meaning",
    night: true,
    show: async (page, lang) => {
      await page.goto(SITE + at(lang, `/poems/${POEM}`));
      await settle(page);
      await page
        .getByRole("button", { name: word(firstNote(lang)) })
        .first()
        .click();
      await settle(page, 700);
    },
  },
  {
    name: "04-poet",
    show: async (page, lang) => {
      await page.goto(SITE + at(lang, `/poets/${POET}`));
      await settle(page);
    },
  },
  {
    name: "05-library",
    saved: (lang) => ({
      poems: ["araka-asiyya-al-dami", "ayniyyat-ibn-zurayq", "banat-suad", "nuniyyat-ibn-zaydun"],
      poets: ["al-mutanabbi", "abu-firas-al-hamdani", "ahmad-shawqi"],
      reciters: ["osama-alwaaedh"],
      playlists: [
        {
          id: "store-memorise",
          name: lang === "ar" ? "للحفظ" : "To learn by heart",
          poems: ["ayniyyat-ibn-zurayq", "lamiyyat-ibn-al-wardi", "nuniyyat-al-busti"],
        },
        {
          id: "store-mutanabbi",
          name: lang === "ar" ? "من شعر المتنبي" : "Al-Mutanabbi",
          poems: ["kafa-bika-daan", "ala-qadri-ahli-al-azm", "liaynayki-ma-yalqa", "maqsurat-al-mutanabbi"],
        },
      ],
    }),
    show: async (page, lang) => {
      await page.goto(SITE + at(lang, "/library"));
      await settle(page);
    },
  },
  {
    name: "06-meters",
    show: async (page, lang) => {
      await page.goto(SITE + at(lang, "/meters"));
      await settle(page);
    },
  },
];

async function screenshots(browser: Browser, out: string) {
  for (const lang of LANGS) {
    for (const [device, options] of Object.entries(DEVICES) as [Device, (typeof DEVICES)[Device]][]) {
      for (const scene of SCENES) {
        const context = await browser.newContext(options);
        await context.addInitScript(
          (items) => {
            for (const [key, value] of items) localStorage.setItem(key, value);
          },
          [
            [SETTINGS_KEY, JSON.stringify({ lang, theme: scene.night ? "night" : "day" })],
            ...(scene.saved ? [[SAVED_KEY, JSON.stringify(scene.saved(lang))]] : []),
          ] as [string, string][],
        );
        const page = await context.newPage();
        await scene.show(page, lang);
        const shot = await page.screenshot();
        // AppGallery takes at most five screenshots (ieasybooks-release store check): the first five scenes.
        const appGallery = SCENES.indexOf(scene) < 5 ? [`appgallery/${lang}/phone`] : [];
        const folders = device === "phone" ? [`google-play/${lang}/phone`, ...appGallery] : [`app-store/${lang}/${device}`];
        for (const folder of folders) {
          mkdirSync(join(out, folder), { recursive: true });
          writeFileSync(join(out, folder, `${scene.name}.png`), shot);
        }
        await context.close();
        console.log(`  ${lang} ${device} ${scene.name}`);
      }
    }
  }
}

/** Google Play's 1024x500 banner: the mark, the name and what Shawared is. */
async function featureGraphic(browser: Browser, lang: Lang, file: string) {
  const fonts = createRequire(join(root(), "apps/app/package.json"));
  const font = (name: string, path: string) =>
    `@font-face { font-family: ${name}; src: url(data:font/ttf;base64,${readFileSync(fonts.resolve(path)).toString("base64")}); }`;
  const name = lang === "ar" ? "شوارد" : "Shawared";
  const tagline = lang === "ar" ? "الشعر العربي كما يُلقى" : "Arabic poetry, as it is recited";
  const html = `<!doctype html><html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}"><head><style>
    ${font("Display", "@expo-google-fonts/reem-kufi/600SemiBold/ReemKufi_600SemiBold.ttf")}
    ${font("Ui", "@expo-google-fonts/readex-pro/400Regular/ReadexPro_400Regular.ttf")}
    html, body { margin: 0; width: 1024px; height: 500px; background: ${DAY.paper}; }
    body { display: flex; align-items: center; justify-content: center; gap: 44px; }
    .mark { width: 190px; height: 190px; }
    .name { font: 600 104px/1.1 Display; color: ${DAY.ink}; margin: 0; }
    .tagline { font: 400 34px/1.4 Ui; color: ${DAY.ink}; opacity: 0.75; margin: 14px 0 0; }
  </style></head><body>
    <div class="mark">${image(190, 1, DAY)}</div>
    <div><p class="name">${name}</p><p class="tagline">${tagline}</p></div>
  </body></html>`;
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file });
  await page.close();
}

/** The icons the stores show on their listings: the app's icon at 512 and 216 pixels. */
function storeIcons(out: string) {
  const work = mkdtempSync(join(tmpdir(), "store-icons-"));
  try {
    for (const [store, side] of [
      ["google-play", 512],
      ["appgallery", 216],
    ] as const) {
      const svg = join(work, `${store}.svg`);
      writeFileSync(svg, image(side, 0.72, DAY, DAY.paper));
      for (const lang of LANGS) {
        mkdirSync(join(out, store, lang), { recursive: true });
        execFileSync("rsvg-convert", ["--format=png", "--output", join(out, store, lang, "icon.png"), svg]);
      }
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

// Each server runs in its own process group, so stopping it stops what it started (wrangler).
function serve(command: string[]): ChildProcess {
  return spawn(command[0]!, command.slice(1), {
    cwd: root(),
    stdio: "ignore",
    detached: true,
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
}

function stop(server: ChildProcess) {
  try {
    process.kill(-server.pid!, "SIGTERM");
  } catch {}
}

async function waitFor(url: string) {
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((done) => setTimeout(done, 1000));
  }
  throw new Error(`${url} didn't answer: build the test release first (bun run web:build:test)`);
}

if (import.meta.main) {
  const out = join(root(), "apps/app/store/screenshots");
  rmSync(out, { recursive: true, force: true });
  storeIcons(out);
  const servers = [serve(["bun", "run", "web:preview"]), serve(["bun", "scripts/serve-test-audio.ts"])];
  try {
    await Promise.all([waitFor(SITE), waitFor("http://127.0.0.1:8788/")]);
    const browser = await chromium.launch({ channel: "chrome", args: ["--autoplay-policy=no-user-gesture-required"] });
    try {
      for (const lang of LANGS) await featureGraphic(browser, lang, join(out, "google-play", lang, "feature-graphic.png"));
      await screenshots(browser, out);
    } finally {
      await browser.close();
    }
  } finally {
    for (const server of servers) stop(server);
  }
  console.log(`store images in ${out}`);
}
