import type { Catalog, CatalogPerson, CatalogPoem, PersonKind, UiLang } from "@shawared/contracts";
import type { Metadata } from "expo-router/server";
import { ABOUT, PRIVACY, SUPPORT } from "../features/about/texts";
import { abyatCount, METER_FEET, METER_IDS, meterName, poemsCount, t } from "../lib/i18n";
import { AUDIO, pathInLang, paths, SITE } from "../lib/routes";
import { catalog, personBundle, poemBundle } from "./content";

// What each web page is rendered with ahead of time, and how it describes itself to search
// engines and link previews. Server only (see ./content.ts).

/** Route params as the router passes them. */
export type Params = Record<string, string | string[]>;
export const idOf = (params: Params) => String(params.id);

/** Poems the home page renders ahead of time; the rest arrive with the catalog. */
const HOME_FIRST = 12;

/** Part of the catalog: some poems, and the people they name. */
function slice(c: Catalog, poems: CatalogPoem[], extra: Partial<Catalog> = {}): Catalog {
  const poets: Record<string, CatalogPerson> = {};
  const reciters: Record<string, CatalogPerson> = {};
  for (const p of poems) {
    const poet = c.poets[p.poet];
    if (poet) poets[p.poet] = poet;
    for (const r of p.recitations) {
      const reciter = c.reciters[r.reciter];
      if (reciter) reciters[r.reciter] = reciter;
    }
  }
  return { schema: c.schema, poems, poets, reciters, meters: {}, ...extra };
}

/** Every page's params, for rendering ahead of time. */
export const staticParams = {
  poems: () => catalog().poems.map((p) => ({ id: p.id })),
  people: (kind: PersonKind) => Object.keys(catalog()[kind]).map((id) => ({ id })),
  meters: () => METER_IDS.map((id) => ({ id })),
};

/** Each page's data (its loader's result). Null when there is no such page. */
export const pageData = {
  home: () => {
    const c = catalog();
    return { catalog: slice(c, c.poems.slice(0, HOME_FIRST)) };
  },
  people: (kind: PersonKind) => {
    const c = catalog();
    return { catalog: slice(c, [], { [kind]: c[kind] }) };
  },
  meters: () => {
    const c = catalog();
    return { catalog: slice(c, [], { meters: c.meters }) };
  },
  person: (kind: PersonKind, id: string, lang: UiLang) => {
    const person = personBundle(kind, id, lang);
    if (!person) return null;
    const c = catalog();
    const ids = new Set(person.poems);
    return {
      catalog: slice(
        c,
        c.poems.filter((p) => ids.has(p.id)),
      ),
      person,
    };
  },
  meter: (id: string) => {
    const c = catalog();
    return {
      catalog: slice(
        c,
        c.poems.filter((p) => p.meter === id),
      ),
    };
  },
  poem: (id: string, lang: UiLang) => {
    const bundle = poemBundle(id, lang);
    return bundle ? { bundle } : null;
  },
};

/** Cuts text at a word boundary, for descriptions. */
function clip(text: string, max = 180): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max / 2)).replace(/[\s,.،؛:]+$/, "")}…`;
}

/** A page in both languages: its address, the other language's address, and its preview. */
function describe(lang: UiLang, path: string, title: string, description: string, more: { type?: string; audio?: string } = {}): Metadata {
  const url = (l: UiLang) => `${SITE}${pathInLang(path, l)}`;
  const other: UiLang = lang === "ar" ? "en" : "ar";
  const brand = t(lang, "brand");
  return {
    title,
    description,
    alternates: { canonical: url(lang), languages: { ar: url("ar"), en: url("en"), "x-default": url("ar") } },
    openGraph: {
      title,
      description,
      url: url(lang),
      siteName: brand,
      type: more.type ?? "website",
      locale: lang === "ar" ? "ar_AR" : "en_US",
      alternateLocale: [other === "ar" ? "ar_AR" : "en_US"],
      ...(more.audio ? { audio: { url: more.audio, type: "audio/mp4" } } : {}),
    },
    twitter: { card: "summary", title, description },
  };
}

const titled = (lang: UiLang, ...parts: string[]) => [...parts, t(lang, "brand")].join(" · ");
const nameIn = (p: { name: string; names: Record<string, string> }, lang: UiLang) => (lang === "ar" ? p.name : (p.names[lang] ?? p.name));

const notFound = (lang: UiLang): Metadata => ({ title: titled(lang, t(lang, "notFound")), robots: { index: false } });

/** Each page's title, description and preview. */
export const pageMeta = {
  home: (lang: UiLang) => describe(lang, paths.home, t(lang, "siteTitle"), t(lang, "tagline")),
  about: (lang: UiLang) => describe(lang, paths.about, ABOUT[lang].title, ABOUT[lang].description),
  privacy: (lang: UiLang) => describe(lang, paths.privacy, titled(lang, PRIVACY[lang].title), PRIVACY[lang].description),
  support: (lang: UiLang) => describe(lang, paths.support, titled(lang, SUPPORT[lang].title), SUPPORT[lang].description),
  people: (kind: PersonKind, lang: UiLang) =>
    describe(
      lang,
      kind === "poets" ? paths.poets : paths.reciters,
      titled(lang, t(lang, kind)),
      t(lang, kind === "poets" ? "metaPoets" : "metaReciters"),
    ),
  meters: (lang: UiLang) => describe(lang, paths.meters, titled(lang, t(lang, "meters")), t(lang, "metaMeters")),
  // What the reader keeps lives on their device: nothing for search engines.
  library: (lang: UiLang): Metadata => ({
    ...describe(lang, paths.library, titled(lang, t(lang, "library")), t(lang, "metaLibrary")),
    robots: { index: false },
  }),
  playlist: (lang: UiLang): Metadata => ({ title: titled(lang, t(lang, "playlists")), robots: { index: false } }),
  person: (kind: PersonKind, id: string, lang: UiLang) => {
    const bundle = personBundle(kind, id, lang);
    if (!bundle) return notFound(lang);
    const name = nameIn(bundle.person, lang);
    const description = bundle.person.bio
      ? clip(bundle.person.bio)
      : t(lang, "metaPerson", { name, count: poemsCount(bundle.poems.length, lang) });
    return describe(lang, kind === "poets" ? paths.poet(id) : paths.reciter(id), titled(lang, name), description, { type: "profile" });
  },
  meter: (id: string, lang: UiLang) => {
    if (!METER_FEET[id]) return notFound(lang);
    const name = meterName(id, lang);
    const count = catalog().meters[id] ?? 0;
    return describe(
      lang,
      paths.meter(id),
      titled(lang, name),
      t(lang, "metaMeter", { meter: name, feet: METER_FEET[id], count: poemsCount(count, lang) }),
    );
  },
  poem: (id: string, lang: UiLang) => {
    const bundle = poemBundle(id, lang);
    const entry = catalog().poems.find((p) => p.id === id);
    if (!bundle || !entry) return notFound(lang);
    const { poem, poet } = bundle;
    const recitation = bundle.recitations[0];
    const reciter = recitation ? (bundle.reciters[recitation.reciter]?.name ?? "") : "";
    const title = lang === "ar" ? poem.title : (entry.titles[lang] ?? poem.title);
    const description = [
      t(lang, "metaPoem", {
        opening: `${entry.opening.sadr} … ${entry.opening.ajuz}`,
        poet: poet.name,
        meter: meterName(poem.meter, lang),
        abyat: abyatCount(poem.abyat.length, lang),
        reciter,
      }),
      bundle.sources.length ? t(lang, "metaNotes") : "",
    ]
      .filter(Boolean)
      .join(" ");
    return describe(lang, paths.poem(id), titled(lang, title, poet.name), description, {
      type: "article",
      ...(recitation ? { audio: `${AUDIO}/${recitation.audio}` } : {}),
    });
  },
  notFound,
};
