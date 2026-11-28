import type { UiLang } from "@shawared/contracts";
import { catalogNow } from "../../lib/content";
import { updateSaved } from "./storage";
import { player } from "../player/player";
import { catalogEntry } from "../player/item";
import { rememberList } from "../player/queue";
import {
  createPlaylist,
  deletePlaylist,
  movePoem,
  newPlaylistId,
  removeFromPlaylist,
  renamePlaylist,
  toggleFavourite,
  togglePoemInPlaylist,
  type FavouriteKind,
} from "./model";

export const toggleFav = (kind: FavouriteKind, id: string) => updateSaved((s) => toggleFavourite(s, kind, id));

export async function newPlaylist(name: string, poems: string[] = []): Promise<string> {
  const id = newPlaylistId();
  await updateSaved((s) => createPlaylist(s, id, name, poems));
  return id;
}

export const rename = (id: string, name: string) => updateSaved((s) => renamePlaylist(s, id, name));
export const removePlaylist = (id: string) => updateSaved((s) => deletePlaylist(s, id));
export const togglePoem = (id: string, poemId: string) => updateSaved((s) => togglePoemInPlaylist(s, id, poemId));
export const removePoem = (id: string, poemId: string) => updateSaved((s) => removeFromPlaylist(s, id, poemId));
export const move = (id: string, poemId: string, neighborId: string | undefined) => updateSaved((s) => movePoem(s, id, poemId, neighborId));

/**
 * Plays `ids` in order from `from`, as if the reader had opened that poem from this list: the mini
 * player shows it at once, and the rest follow when it ends.
 */
export function playList(ids: readonly string[], lang: UiLang, from = 0) {
  const id = ids[from];
  const entry = id ? catalogEntry(catalogNow(), id, lang) : null;
  if (!id || !entry) return;
  rememberList(id, ids);
  player.play(entry);
}
