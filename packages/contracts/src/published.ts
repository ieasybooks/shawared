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

export const CatalogPoem = z.object({
  id: z.string(),
  title: z.string(),
  /** Translated titles by language. */
  titles: z.record(z.string(), z.string()).default({}),
  poet: z.string(),
  meter: z.string(),
  rawiy: z.string().optional(),
  abyat: z.number(),
  abyat_in_full: z.number(),
  opening: PublishedBayt,
  /** Languages that have explanations, translations or word meanings. */
  langs: z.array(z.string()).default([]),
  recitations: z.array(z.object({ id: z.string(), reciter: z.string(), duration: z.number() })).default([]),
  /** Changes whenever any of the poem's files change. */
  hash: z.string(),
});
export type CatalogPoem = z.infer<typeof CatalogPoem>;

export const CatalogPerson = z.object({
  id: z.string(),
  name: z.string(),
  names: z.record(z.string(), z.string()).default({}),
  died: Died.optional(),
});
export type CatalogPerson = z.infer<typeof CatalogPerson>;

/** v1/catalog.json */
export const Catalog = z.object({
  schema: z.number(),
  poems: z.array(CatalogPoem),
  poets: z.record(z.string(), CatalogPerson),
  reciters: z.record(z.string(), CatalogPerson),
});
export type Catalog = z.infer<typeof Catalog>;

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
  /** A key under the audio base URL: <poem>/<recitation>.m4a */
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
    rawiy: z.string().optional(),
    abyat_in_full: z.number(),
    abyat: z.array(PublishedBayt),
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

export const catalogPath = () => `v${SCHEMA}/catalog.json`;
export const bundlePath = (poemId: string, lang: string) => `v${SCHEMA}/poems/${poemId}/${lang}.json`;
