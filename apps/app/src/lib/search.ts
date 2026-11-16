import type { Catalog, CatalogPoem } from "@shawared/contracts";

/**
 * Folds text for matching: no harakat, tatweel or Latin diacritics, one form of alif,
 * ya and ta marbuta, lowercase. "تَقولُ" finds "تقول", "Mutaqarib" finds "Mutaqārib".
 */
export function fold(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[ً-ٰٟـ̀-ͯ]/g, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[ʿʾ'’`ʼ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

type Indexed = { poem: CatalogPoem; title: string; rest: string };

/** What a poem can be found by: its titles, its first bayt, its poet and reciters, in every language. */
export function indexCatalog(catalog: Catalog): Indexed[] {
  return catalog.poems.map((poem) => {
    const names = (p: { name: string; names: Record<string, string> } | undefined) => (p ? [p.name, ...Object.values(p.names)] : []);
    const people = [...names(catalog.poets[poem.poet]), ...poem.recitations.flatMap((r) => names(catalog.reciters[r.reciter]))];
    return {
      poem,
      title: fold([poem.title, ...Object.values(poem.titles)].join(" ")),
      rest: fold([poem.opening.sadr, poem.opening.ajuz, ...people].join(" ")),
    };
  });
}

/** Poems matching every word of the query; title matches first, otherwise newest first. */
export function search(index: Indexed[], query: string): CatalogPoem[] {
  const words = fold(query).split(" ").filter(Boolean);
  if (words.length === 0) return index.map((i) => i.poem);
  const hits: { poem: CatalogPoem; inTitle: boolean }[] = [];
  for (const i of index) {
    const all = `${i.title} ${i.rest}`;
    if (words.every((w) => all.includes(w))) hits.push({ poem: i.poem, inTitle: words.every((w) => i.title.includes(w)) });
  }
  return [...hits.filter((h) => h.inTitle), ...hits.filter((h) => !h.inTitle)].map((h) => h.poem);
}

/** People whose name, in any language, holds every word of the query. */
export function searchPeople<P extends { name: string; names: Record<string, string> }>(people: readonly P[], query: string): P[] {
  const words = fold(query).split(" ").filter(Boolean);
  if (words.length === 0) return [...people];
  return people.filter((p) => {
    const all = fold([p.name, ...Object.values(p.names)].join(" "));
    return words.every((w) => all.includes(w));
  });
}
