// The files the app downloads, built from content/ by scripts/build-content.ts.
// Lenient on purpose: unknown fields are dropped, so a newer publish never breaks an older app.
// A change old apps can't read gets a new SCHEMA folder (v2/), not an edit here.
import { z } from "zod";

export const SCHEMA = 1;
/** UI languages: every poem is published in each, even with nothing but the Arabic text. */
export const UI_LANGS = ["ar", "en"] as const;
export type UiLang = (typeof UI_LANGS)[number];

const Died = z.object({ hijri: z.number(), ce: z.number() });

export const PublishedBayt = z.object({ n: z.number(), sadr: z.string(), ajuz: z.string() });
export type PublishedBayt = z.infer<typeof PublishedBayt>;

const BilingualText = z.object({ ar: z.string(), en: z.string() });
export const CatalogTheme = z.object({
  name: BilingualText,
  definition: BilingualText,
  poems: z.number(),
  example: z.object({
    poem: z.string(),
    bayt: PublishedBayt,
    measure: z.number(),
    kashida: z.record(z.string(), z.array(z.tuple([z.number(), z.number()]))),
  }),
});
export type CatalogTheme = z.infer<typeof CatalogTheme>;

export const CatalogPoem = z.object({
  id: z.string(),
  title: z.string(),
  /** Translated titles by language. */
  titles: z.record(z.string(), z.string()).default({}),
  poet: z.string(),
  meter: z.string(),
  /** The primary theme. Earlier v1 catalogs predate themes. */
  theme: z.string().optional(),
  rawiy: z.string().optional(),
  abyat: z.number(),
  abyat_in_full: z.number(),
  /** ISO date the poem joined the library. The catalog lists newest first. */
  added: z.string(),
  opening: PublishedBayt,
  /** Languages that have explanations, translations or word meanings. */
  langs: z.array(z.string()).default([]),
  recitations: z
    .array(
      z.object({
        id: z.string(),
        reciter: z.string(),
        duration: z.number(),
        /** The recording's key under the audio base URL, as in the poem's bundle: what plays next is queued from the catalog. */
        audio: z.string().optional(),
      }),
    )
    .default([]),
  /** Changes whenever any of the poem's files change. */
  hash: z.string(),
  /** The poem's measure and the opening bayt's kashida, as in its bundle. */
  measure: z.number().optional(),
  kashida: z.record(z.string(), z.array(z.tuple([z.number(), z.number()]))).default({}),
});
export type CatalogPoem = z.infer<typeof CatalogPoem>;

export const CatalogPerson = z.object({
  id: z.string(),
  name: z.string(),
  names: z.record(z.string(), z.string()).default({}),
  died: Died.optional(),
  /** How many poems they have: a poet's poems, or the poems a reciter recites. */
  poems: z.number().default(0),
});
export type CatalogPerson = z.infer<typeof CatalogPerson>;

/** v1/catalog.json */
export const Catalog = z.object({
  schema: z.number(),
  poems: z.array(CatalogPoem),
  poets: z.record(z.string(), CatalogPerson),
  reciters: z.record(z.string(), CatalogPerson),
  /** How many poems each meter has. */
  meters: z.record(z.string(), z.number()).default({}),
  themes: z.record(z.string(), CatalogTheme).optional(),
});
export type Catalog = z.infer<typeof Catalog>;

/** A theme reached by its route, including on a device with an older catalog. */
export function themeOf(catalog: Catalog | undefined, id: string): CatalogTheme | undefined {
  const themes = catalog?.themes;
  return themes && Object.hasOwn(themes, id) ? themes[id] : undefined;
}

export const PublishedWordNote = z.object({
  word: z.string(),
  head: z.string().optional(),
  root: z.string().optional(),
  meaning: z.string(),
});
export type PublishedWordNote = z.infer<typeof PublishedWordNote>;

export const PublishedSource = z.object({
  /** The file it came from: "ar", "ar.wahidi". */
  id: z.string(),
  name: z.string(),
  title: z.string().optional(),
  intro: z.string().optional(),
  abyat: z
    .record(
      z.string(),
      z.object({
        translation: z.union([z.string(), z.tuple([z.string(), z.string()])]).optional(),
        sharh: z.string().optional(),
      }),
    )
    .default({}),
  words: z.record(z.string(), PublishedWordNote).default({}),
});
export type PublishedSource = z.infer<typeof PublishedSource>;

export const PublishedRecitation = z.object({
  id: z.string(),
  reciter: z.string(),
  /** A key under the audio base URL: <poem>/<recitation>.<hash>.m4a once uploaded, which never takes other bytes. */
  audio: z.string(),
  duration: z.number(),
  timeline: z.array(z.tuple([z.string(), z.number(), z.number()])),
});
export type PublishedRecitation = z.infer<typeof PublishedRecitation>;

/** v1/poems/<id>/<lang>.json: everything one reader needs for one poem. */
export const PoemBundle = z.object({
  schema: z.number(),
  lang: z.string(),
  poem: z.object({
    id: z.string(),
    poet: z.string(),
    title: z.string(),
    meter: z.string(),
    /** Primary first. The labels travel with a downloaded poem. */
    themes: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
    rawiy: z.string().optional(),
    abyat_in_full: z.number(),
    abyat: z.array(PublishedBayt),
    /**
     * Every half is set to this width, in em of the verse font: the longest half's. Absent,
     * halves keep their own widths.
     */
    measure: z.number().optional(),
    /** Kashida by line address ("7.1"): [offset in the half, tatweels]. Shown, never part of the text. */
    kashida: z.record(z.string(), z.array(z.tuple([z.number(), z.number()]))).default({}),
  }),
  /** In the bundle's language; empty when the language has nothing for this poem. */
  sources: z.array(PublishedSource).default([]),
  recitations: z.array(PublishedRecitation).default([]),
  poet: z.object({ id: z.string(), name: z.string(), bio: z.string().optional() }),
  reciters: z
    .record(z.string(), z.object({ id: z.string(), name: z.string(), links: z.record(z.string(), z.string()).optional() }))
    .default({}),
});
export type PoemBundle = z.infer<typeof PoemBundle>;

/** v1/poets/<id>/<lang>.json and v1/reciters/<id>/<lang>.json: a person's page. */
export const PersonBundle = z.object({
  schema: z.number(),
  lang: z.string(),
  person: z.object({
    id: z.string(),
    /** The Arabic name, and the name in other languages. */
    name: z.string(),
    names: z.record(z.string(), z.string()).default({}),
    full_name: z.string().optional(),
    died: Died.optional(),
    bio: z.string().optional(),
    links: z.record(z.string(), z.string()).optional(),
  }),
  /** Their poems (for a reciter: the poems they recite), newest first. */
  poems: z.array(z.string()),
});
export type PersonBundle = z.infer<typeof PersonBundle>;
export type PersonKind = "poets" | "reciters";

/** A half as shown: its text with the kashida of its plan inserted. */
export function withKashida(text: string, plan: readonly (readonly [number, number])[] | undefined): string {
  if (!plan?.length) return text;
  let out = "";
  let last = 0;
  for (const [offset, count] of [...plan].sort((a, b) => a[0] - b[0])) {
    out += text.slice(last, offset) + "ـ".repeat(count);
    last = offset;
  }
  return out + text.slice(last);
}

export const catalogPath = () => `v${SCHEMA}/catalog.json`;
export const personPath = (kind: PersonKind, id: string, lang: string) => `v${SCHEMA}/${kind}/${id}/${lang}.json`;
export const bundlePath = (poemId: string, lang: string) => `v${SCHEMA}/poems/${poemId}/${lang}.json`;
