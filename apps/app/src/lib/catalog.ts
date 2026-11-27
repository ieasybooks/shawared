import type { CatalogPoem } from "@shawared/contracts";
import { rhymeFor } from "./rhymes";

/** A person's name in the reader's language. */
export const nameOf = (person: { name: string; names: Record<string, string> } | undefined, lang: string) =>
  person ? (lang === "ar" ? person.name : (person.names[lang] ?? person.name)) : "";

export const poemsForMeter = (poems: readonly CatalogPoem[], meter: string) => poems.filter((poem) => poem.meter === meter);

export const poemsForTheme = (poems: readonly CatalogPoem[], theme: string) => poems.filter((poem) => poem.theme === theme);

export const poemsForRhyme = (poems: readonly CatalogPoem[], rhyme: string) => poems.filter((poem) => rhymeFor(poem.rawiy)?.id === rhyme);

export function poemsWithIds(poems: readonly CatalogPoem[], ids: readonly string[]) {
  const included = new Set(ids);
  return poems.filter((poem) => included.has(poem.id));
}
