import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UiLang } from "@shawared/contracts";
import { palettes, type Palette, type ThemeName } from "@shawared/design";
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";

type Settings = { lang: UiLang; theme: ThemeName };
type SettingsValue = Settings & {
  palette: Palette;
  rtl: boolean;
  setLang: (l: UiLang) => void;
  setTheme: (t: ThemeName) => void;
};

const KEY = "shawared.settings.v1";
const DEFAULTS: Settings = { lang: "ar", theme: "day" };
const Ctx = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  // Reads the saved settings once, from storage outside React.
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(raw) as Partial<Settings>;
        setSettings({
          lang: s.lang === "en" ? "en" : "ar",
          theme: s.theme === "night" ? "night" : "day",
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  const palette = palettes[settings.theme];
  // The page around the app on the web: direction, language, colours.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const root = document.documentElement;
    root.lang = settings.lang;
    root.dir = settings.lang === "ar" ? "rtl" : "ltr";
    root.style.colorScheme = settings.theme === "night" ? "dark" : "light";
    document.body.style.backgroundColor = palette.bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.bg);
  }, [settings, palette]);

  const value = useMemo<SettingsValue>(
    () => ({
      ...settings,
      palette,
      rtl: settings.lang === "ar",
      setLang: (lang) => setSettings((s) => ({ ...s, lang })),
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    }),
    [settings, palette],
  );
  if (!loaded) return null;
  return <Ctx value={value}>{children}</Ctx>;
}

export function useSettings() {
  const v = use(Ctx);
  if (!v) throw new Error("useSettings outside SettingsProvider");
  return v;
}
