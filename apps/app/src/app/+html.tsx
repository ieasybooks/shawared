import { palettes } from "@shawared/design";
import { useServerDocumentContext } from "expo-router/html";
import type { ReactNode } from "react";
import { t } from "../lib/i18n";
import { langOfPath, pathInLang, paths } from "../lib/routes";
import { RESPONSIVE_CSS, WIDE_MIN } from "../lib/responsive";
import { SETTINGS_KEY } from "../lib/settings";
import { storeRedirect } from "../lib/stores";

// The document around every web page, rendered ahead of time (web only).
//
// Pages are rendered in the day theme, for every window at once: the server has no window and
// no settings. Phones and wide windows are laid out by CSS from WIDE_MIN (lib/responsive), so
// every window sees the page at once, in its layout. The night theme would change the page as
// soon as the app starts, so for it the page waits for the app before it shows (data-wait), on
// the night background.
const waitScript = `(function(){var d=document.documentElement;try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)})||"{}");if(s.theme==="night"){d.setAttribute("data-theme","night");d.setAttribute("data-wait","");setTimeout(function(){d.removeAttribute("data-wait")},4000)}}catch(e){}})();`;

const css = `
${RESPONSIVE_CSS}
/* The poem's explanation is a sheet over the verses on phones and a panel beside them on wide
   windows (features/listening/layouts.tsx): there it stays in place and open. */
@media (min-width: ${WIDE_MIN}px) {
  html [data-panel] { transform: none !important; opacity: 1 !important; pointer-events: auto !important; }
  html [data-panel] > * { pointer-events: auto; }
}
html, body { height: 100%; background: ${palettes.day.bg}; }
html[data-theme="night"], html[data-theme="night"] body { background: ${palettes.night.bg}; color-scheme: dark; }
body { overflow: hidden; margin: 0; }
/* dvh follows the phone browser's toolbars, so the player stays on screen. */
#root { display: flex; height: 100%; height: 100dvh; flex: 1; }
html[data-wait] #root { visibility: hidden; }
`;

export default function Root({ children, pathname }: { children: ReactNode; pathname: string }) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  const lang = langOfPath(pathname);
  const appPage = pathname === paths.app || pathname === pathInLang(paths.app, "en");
  return (
    <html {...htmlAttributes} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* shawared.com/app sends a phone on to its store before the app's scripts run (React puts the
            page's meta and preload tags ahead of every script). */}
        {appPage && <script dangerouslySetInnerHTML={{ __html: storeRedirect }} />}
        <meta name="theme-color" content={palettes.day.bg} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="شوارد" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: waitScript }} />
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
          <style>{"html[data-wait] #root { visibility: visible; }"}</style>
        </noscript>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
