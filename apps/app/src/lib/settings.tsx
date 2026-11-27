import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UiLang } from "@shawared/contracts";
import { palettes, type Palette, type ThemeName } from "@shawared/design";
import { router, usePathname } from "expo-router";
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { alignFor } from "./align";
import { DEFAULT_SETTINGS, parseSettings, SETTINGS_KEY, THEME_ATTRIBUTE, THEME_WAIT_ATTRIBUTE, type Settings } from "./preferences";
import { langOfPath, pathInLang } from "./routes";

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

const Ctx = createContext<SettingsValue | null>(null);
const web = Platform.OS === "web";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Settings>(DEFAULT_SETTINGS);
  // The web renders right away, so pages can be built ahead of time; the apps wait for storage.
  const [loaded, setLoaded] = useState(web);
  const [restored, setRestored] = useState(false);
  const pathname = usePathname();
  const lang: UiLang = web ? langOfPath(pathname) : stored.lang;
  const theme = stored.theme;

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => setStored(parseSettings(raw)))
      .catch(() => {})
      .finally(() => {
        setLoaded(true);
        setRestored(true);
      });
  }, []);

  useEffect(() => {
    if (!web || !restored || typeof document === "undefined") return;
    const frame = requestAnimationFrame(() => document.documentElement.removeAttribute(THEME_WAIT_ATTRIBUTE));
    return () => cancelAnimationFrame(frame);
  }, [restored]);

  const save = useCallback((next: Settings) => {
    setStored(next);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const palette = palettes[theme];
  useEffect(() => {
    if (!web || typeof document === "undefined") return;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.style.colorScheme = theme === "night" ? "dark" : "light";
    root.setAttribute(THEME_ATTRIBUTE, theme);
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
      href: (path) => (web ? pathInLang(path, lang) : path),
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
