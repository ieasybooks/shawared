import type { Catalog, PoemBundle, PublishedRecitation } from "@shawared/contracts";
import { nameOf } from "../../lib/catalog";

export type NowItem = {
  poemId: string;
  title: string;
  poet: string;
  reciter: string;
  abyat: number;
  lang: string;
  recitation: PublishedRecitation;
  /** Catalog metadata can play immediately, before the bundle supplies its timings. */
  timings: "pending" | "loaded";
};

export const itemKey = (item: NowItem) => `${item.poemId}/${item.recitation.id}`;
export const sameItem = (a: NowItem | null, b: NowItem) => !!a && itemKey(a) === itemKey(b);

export function nowItemOf(bundle: PoemBundle, recitation = bundle.recitations[0]): NowItem | null {
  if (!recitation) return null;
  return {
    poemId: bundle.poem.id,
    title: bundle.poem.title,
    poet: bundle.poet.name,
    reciter: bundle.reciters[recitation.reciter]?.name ?? recitation.reciter,
    abyat: bundle.poem.abyat.length,
    lang: bundle.lang,
    recitation,
    timings: "loaded",
  };
}

export function catalogEntry(catalog: Catalog | undefined, poemId: string, lang: string): NowItem | null {
  const poem = catalog?.poems.find((p) => p.id === poemId);
  const rec = poem?.recitations[0];
  if (!catalog || !poem || !rec?.audio) return null;
  return {
    poemId,
    title: poem.title,
    poet: nameOf(catalog.poets[poem.poet], lang),
    reciter: nameOf(catalog.reciters[rec.reciter], lang),
    abyat: poem.abyat,
    lang,
    recitation: { id: rec.id, reciter: rec.reciter, audio: rec.audio, duration: rec.duration, timeline: [] },
    timings: "pending",
  };
}
