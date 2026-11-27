import type { UiLang } from "@shawared/contracts";
import type { ThemeName } from "@shawared/design";

export type Settings = { lang: UiLang; theme: ThemeName };

export const SETTINGS_KEY = "shawared.settings.v1";
export const DEFAULT_SETTINGS: Settings = { lang: "ar", theme: "day" };

export function parseSettings(raw: string | null): Settings {
  try {
    const value = JSON.parse(raw ?? "null") as Partial<Settings> | null;
    return { lang: value?.lang === "en" ? "en" : "ar", theme: value?.theme === "night" ? "night" : "day" };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export const THEME_ATTRIBUTE = "data-theme";
export const THEME_WAIT_ATTRIBUTE = "data-wait";

// Prerendered pages use day colours. Night pages wait for the restored theme's first paint;
// the fail-open timer still shows the page when application scripts cannot load.
export const THEME_PREPAINT_SCRIPT = `(function(){var d=document.documentElement;try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)})||"{}");if(s&&s.theme==="night"){d.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},"night");d.setAttribute(${JSON.stringify(THEME_WAIT_ATTRIBUTE)},"");setTimeout(function(){d.removeAttribute(${JSON.stringify(THEME_WAIT_ATTRIBUTE)})},4000)}}catch(e){}})();`;
