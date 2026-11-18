import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UiLang } from "@shawared/contracts";
import { palettes, type Palette, type ThemeName } from "@shawared/design";
import { router, usePathname } from "expo-router";
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { alignFor } from "./align";
import { hrefIn, langOfPath, pathInLang } from "./routes";

type Settings = { lang: UiLang; theme: ThemeName };
type SettingsValue = Settings & {
  palette: Palette;
  rtl: boolean;
  /** textAlign for the start of the UI's reading direction, on every platform. */
  start: "left" | "right";
  setLang: (l: UiLang) => void;
  setTheme: (t: ThemeName) => void;
  /** A path in the reader's language (English pages live under /en on the web). */
  href: (path: string) => string;
};

/** Where settings are saved (on the web, localStorage; the page reads the theme before it shows). */
export const SETTINGS_KEY = "shawared.settings.v1";
const DEFAULTS: Settings = { lang: "ar", theme: "day" };
const Ctx = createContext<SettingsValue | null>(null);
const web = Platform.OS === "web";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Settings>(DEFAULTS);
  // The web renders right away, so pages can be built ahead of time; the apps wait for storage.
  const [loaded, setLoaded] = useState(web);
  const [restored, setRestored] = useState(false);
  const pathname = usePathname();
  // On the web the address decides the language.
  const lang: UiLang = web ? langOfPath(pathname) : stored.lang;
  const theme = stored.theme;

  // Reads the saved settings once, from storage outside React.
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(raw) as Partial<Settings>;
        setStored({ lang: s.lang === "en" ? "en" : "ar", theme: s.theme === "night" ? "night" : "day" });
      })
      .catch(() => {})
      .finally(() => {
        setLoaded(true);
        setRestored(true);
      });
  }, []);

  // A web page in the night theme waits to show until the theme is applied (see
  // app/+html.tsx). It is by now; show the page once it's painted.
  useEffect(() => {
    if (!web || !restored || typeof document === "undefined") return;
    const frame = requestAnimationFrame(() => document.documentElement.removeAttribute("data-wait"));
    return () => cancelAnimationFrame(frame);
  }, [restored]);

  const save = useCallback((next: Settings) => {
    setStored(next);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const palette = palettes[theme];
  // The page around the app on the web: direction, language, colours.
  useEffect(() => {
    if (!web || typeof document === "undefined") return;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.style.colorScheme = theme === "night" ? "dark" : "light";
    root.dataset.theme = theme;
    document.body.style.backgroundColor = palette.bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.bg);
  }, [lang, theme, palette]);

  const value = useMemo<SettingsValue>(
    () => ({
      lang,
      theme,
      palette,
      rtl: lang === "ar",
      start: alignFor(lang === "ar" ? "rtl" : "ltr").start,
      setLang: (next) => {
        save({ ...stored, lang: next });
        if (web && next !== lang) router.replace(`${pathInLang(pathname, next)}${typeof location === "undefined" ? "" : location.search}`);
      },
      setTheme: (next) => save({ ...stored, theme: next }),
      href: (path) => hrefIn(lang, path),
    }),
    [lang, theme, palette, stored, save, pathname],
  );
  if (!loaded) return null;
  return <Ctx value={value}>{children}</Ctx>;
}

export function useSettings() {
  const v = use(Ctx);
  if (!v) throw new Error("useSettings outside SettingsProvider");
  return v;
}
