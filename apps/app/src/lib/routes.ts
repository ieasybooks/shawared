import type { PersonKind, UiLang } from "@shawared/contracts";

// On the web the language is part of the address, so each page can be rendered ahead of
// time in both languages: Arabic at /poems/x, English at /en/poems/x. The apps keep the
// language in settings and use the bare paths.

export const langOfPath = (pathname: string): UiLang => (pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar");

/** The same page in another language. */
export function pathInLang(pathname: string, lang: UiLang): string {
  const bare = langOfPath(pathname) === "en" ? pathname.slice(3) || "/" : pathname;
  return lang === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare;
}

export const paths = {
  home: "/",
  poets: "/poets",
  poet: (id: string) => `/poets/${id}`,
  reciters: "/reciters",
  reciter: (id: string) => `/reciters/${id}`,
  themes: "/themes",
  theme: (id: string) => `/themes/${id}`,
  rhymes: "/rhymes",
  rhyme: (id: string) => "/rhymes/" + id,
  meters: "/meters",
  meter: (id: string) => `/meters/${id}`,
  poem: (id: string, bayt?: number) => (bayt ? `/poems/${id}?b=${bayt}` : `/poems/${id}`),
  library: "/library",
  /** A playlist the reader made: it lives on the device, so the address carries its id. */
  playlist: (id: string) => `/playlist?id=${encodeURIComponent(id)}`,
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  support: "/support",
  /** The apps in the stores: a phone goes on to its own (lib/stores). */
  app: "/app",
};

type ContentPage = { kind: "poems" | PersonKind; id: string };

export function contentPage(href: string): ContentPage | undefined {
  const match = /^\/(poems|poets|reciters)\/([^/?#]+)/.exec(pathInLang(href, "ar"));
  return match ? { kind: match[1] as ContentPage["kind"], id: match[2]! } : undefined;
}
