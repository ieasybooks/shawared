import type { UiLang } from "@shawared/contracts";
import { Platform } from "react-native";

// On the web the language is part of the address, so each page can be rendered ahead of
// time in both languages: Arabic at /poems/x, English at /en/poems/x. The apps keep the
// language in settings and use the bare paths.

export const SITE = "https://shawared.com";

/** Where recordings are served: audio.shawared.com in release builds, which set EXPO_PUBLIC_AUDIO_URL; the site's /audio otherwise. */
export const AUDIO = process.env.EXPO_PUBLIC_AUDIO_URL ?? `${SITE}/audio`;

export const langOfPath = (pathname: string): UiLang => (pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar");

/** The same page in another language. */
export function pathInLang(pathname: string, lang: UiLang): string {
  const bare = langOfPath(pathname) === "en" ? pathname.slice(3) || "/" : pathname;
  return lang === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare;
}

/** A path in the reader's language. */
export function hrefIn(lang: UiLang, path: string): string {
  return Platform.OS === "web" ? pathInLang(path, lang) : path;
}

export const paths = {
  home: "/",
  poets: "/poets",
  poet: (id: string) => `/poets/${id}`,
  reciters: "/reciters",
  reciter: (id: string) => `/reciters/${id}`,
  meters: "/meters",
  meter: (id: string) => `/meters/${id}`,
  poem: (id: string, bayt?: number) => (bayt ? `/poems/${id}?b=${bayt}` : `/poems/${id}`),
};
