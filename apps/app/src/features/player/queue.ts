// What plays after a poem: the next one in the list the reader opened it from (home, a poet's,
// a reciter's or a meter's poems, as that list showed them), otherwise the next on the home page.
// Pure, so the rules are tested without a player.
import type { Catalog } from "@shawared/contracts";
import { t } from "../../lib/i18n";

/** The list each poem was last opened from, by poem id. */
const openedFrom = new Map<string, readonly string[]>();

/** A list's row was pressed: its poem was opened from these poems, in this order. */
export function rememberList(poemId: string, ids: readonly string[]) {
  openedFrom.set(poemId, ids);
}

/** Forget every list (tests). */
export function forgetLists() {
  openedFrom.clear();
}

/**
 * The poems that play one after another from `poemId`: the list it was opened from, else the
 * home page's order (the catalog's), else the poem alone. Only poems the catalog can queue (it
 * knows their recording) are kept, and always `poemId` itself.
 */
export function queueFor(poemId: string, catalog: Catalog | undefined): string[] {
  const playable = new Set(catalog?.poems.filter((p) => p.recitations[0]?.audio).map((p) => p.id));
  const opened = openedFrom.get(poemId);
  const home = catalog?.poems.map((p) => p.id);
  const list = opened?.includes(poemId) ? opened : home?.includes(poemId) ? home : [poemId];
  return list.filter((id) => id === poemId || playable.has(id));
}

/** The lock screen's line under the title: the poet, then who recites. */
export const byline = (poet: string, reciter: string, lang: string) =>
  `${poet} · ${t(lang === "en" ? "en" : "ar", "recitedBy", { name: reciter })}`;
