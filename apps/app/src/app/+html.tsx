import { SITE } from "@shawared/contracts";
import { palettes } from "@shawared/design";
import { useServerDocumentContext } from "expo-router/html";
import type { ReactNode } from "react";
import { t } from "../lib/i18n";
import { langOfPath, pathInLang, paths } from "../lib/routes";
import { RESPONSIVE_CSS, WIDE_MIN } from "../lib/responsive";
import { THEME_ATTRIBUTE, THEME_PREPAINT_SCRIPT, THEME_WAIT_ATTRIBUTE } from "../lib/preferences";
import { APP_STORE_ID, appBanner, smartBannerArgument, storeRedirect } from "../lib/stores";

// The document around every web page, rendered ahead of time (web only).
//
// Pages are rendered in the day theme, for every window at once: the server has no window and
// no settings. Phones and wide windows are laid out by CSS from WIDE_MIN (lib/responsive), so
// every window sees the page at once, in its layout. The night theme would change the page as
// soon as the app starts, so for it the page waits for the app before it shows (data-wait), on
// the night background.
const BANNER_HEIGHT = 60;

const css = `
${RESPONSIVE_CSS}
/* The poem's explanation is a sheet over the verses on phones and a panel beside them on wide
   windows (features/listening/layouts.tsx): there it stays in place and open. */
@media (min-width: ${WIDE_MIN}px) {
  html [data-panel] { transform: none !important; opacity: 1 !important; pointer-events: auto !important; }
  html [data-panel] > * { pointer-events: auto; }
}
html, body { height: 100%; background: ${palettes.day.bg}; }
html[${THEME_ATTRIBUTE}="night"], html[${THEME_ATTRIBUTE}="night"] body { background: ${palettes.night.bg}; color-scheme: dark; }
body { overflow: hidden; margin: 0; }
/* dvh follows the phone browser's toolbars, so the player stays on screen. */
#root { display: flex; height: 100%; height: 100dvh; flex: 1; }
html[${THEME_WAIT_ATTRIBUTE}] #root { visibility: hidden; }
/* The app bar on phones' browsers (lib/stores appBanner), above the app, which makes room for it. */
#app-banner { display: none; }
html[data-app-banner] #app-banner {
  display: flex; position: fixed; z-index: 10; top: 0; left: 0; right: 0; height: ${BANNER_HEIGHT}px; box-sizing: border-box;
  align-items: center; gap: 10px; padding: 0 12px;
  background: ${palettes.day.raise}; color: ${palettes.day.fg}; border-bottom: 1px solid ${palettes.day.line};
  font-family: ReadexPro_400Regular, system-ui, sans-serif;
}
html[data-app-banner] #root { margin-top: ${BANNER_HEIGHT}px; height: calc(100% - ${BANNER_HEIGHT}px); height: calc(100dvh - ${BANNER_HEIGHT}px); }
#app-banner button {
  flex: none; display: grid; place-items: center; width: 32px; height: 32px; margin: 0; padding: 0;
  border: 0; border-radius: 50%; background: none; color: inherit; cursor: pointer;
}
#app-banner img { flex: none; width: 40px; height: 40px; border-radius: 9px; border: 1px solid ${palettes.day.line}; }
#app-banner p { flex: 1; min-width: 0; margin: 0; display: flex; flex-direction: column; line-height: 1.35; }
#app-banner strong { font-family: ReadexPro_500Medium, system-ui, sans-serif; font-weight: normal; font-size: 15px; }
#app-banner span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13px; color: ${palettes.day.muted}; }
#app-banner a {
  flex: none; padding: 7px 18px; border-radius: 999px; text-decoration: none;
  font-family: ReadexPro_500Medium, system-ui, sans-serif; font-size: 14px;
  background: ${palettes.day.fg}; color: ${palettes.day.bg};
}
html[${THEME_ATTRIBUTE}="night"] #app-banner { background: ${palettes.night.raise}; color: ${palettes.night.fg}; border-color: ${palettes.night.line}; }
html[${THEME_ATTRIBUTE}="night"] #app-banner img { border-color: ${palettes.night.line}; }
html[${THEME_ATTRIBUTE}="night"] #app-banner span { color: ${palettes.night.muted}; }
html[${THEME_ATTRIBUTE}="night"] #app-banner a { background: ${palettes.night.fg}; color: ${palettes.night.bg}; }
`;

const bannerTexts = Object.fromEntries(
  (["ar", "en"] as const).map((l) => [
    l,
    { name: t(l, "brand"), text: t(l, "appBannerText"), open: t(l, "openApp"), close: t(l, "close") },
  ]),
) as Record<"ar" | "en", { name: string; text: string; open: string; close: string }>;

export default function Root({ children, pathname }: { children: ReactNode; pathname: string }) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  const lang = langOfPath(pathname);
  const appPage = pathInLang(pathname, "ar") === paths.app;
  return (
    <html {...htmlAttributes} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* shawared.com/app sends a phone on to its store before the app's scripts run (React puts the
            page's meta and preload tags ahead of every script). */}
        {appPage && <script dangerouslySetInnerHTML={{ __html: storeRedirect }} />}
        {/* Elsewhere, Safari's own banner offers the app on iPhones and iPads, and opens it at the
            page; other phones' browsers get the app bar (below). */}
        {!appPage && <meta name="apple-itunes-app" content={`app-id=${APP_STORE_ID}`} />}
        {!appPage && <script dangerouslySetInnerHTML={{ __html: smartBannerArgument(SITE) }} />}
        <meta name="theme-color" content={palettes.day.bg} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="شوارد" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: THEME_PREPAINT_SCRIPT }} />
        <style id="shawared-base" dangerouslySetInnerHTML={{ __html: css }} />
        {/* Expo gives the not-found page no metadata of its own. */}
        {pathname.includes("+not-found") && (
          <>
            <title>{`${t("ar", "notFound")} · ${t("ar", "brand")}`}</title>
            <meta name="robots" content="noindex" />
          </>
        )}
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        <noscript>
          <style>{`html[${THEME_WAIT_ATTRIBUTE}] #root { visibility: visible; }`}</style>
        </noscript>
        {!appPage && (
          <>
            <aside id="app-banner">
              <button type="button">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <img alt="" width={40} height={40} />
              <p>
                <strong />
                <span />
              </p>
              <a href="/app" />
            </aside>
            <script dangerouslySetInnerHTML={{ __html: appBanner(bannerTexts) }} />
          </>
        )}
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
