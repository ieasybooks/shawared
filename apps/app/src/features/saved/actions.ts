import type { UiLang } from "@shawared/contracts";
import { catalogNow } from "../../lib/content";
import { t } from "../../lib/i18n";
import { updateSaved } from "../../lib/saved";
import { player, type NowItem } from "../player/player";
import { catalogEntry, rememberList } from "../player/queue";
import {
  addToPlaylist,
  createPlaylist,
  deletePlaylist,
  movePoem,
  newPlaylistId,
  removeFromPlaylist,
  renamePlaylist,
  toggleFavourite,
  togglePoemInPlaylist,
  type FavouriteKind,
  type Playlist,
} from "./model";

// What the library's buttons do. Each change is saved on the device at once.

export const toggleFav = (kind: FavouriteKind, id: string) => updateSaved((s) => toggleFavourite(s, kind, id));

/** Makes a playlist, holding `poems`, and returns its id. */
export function newPlaylist(name: string, poems: string[] = []): string {
  const id = newPlaylistId();
  void updateSaved((s) => createPlaylist(s, id, name, poems));
  return id;
}

export const rename = (id: string, name: string) => updateSaved((s) => renamePlaylist(s, id, name));
export const removePlaylist = (id: string) => updateSaved((s) => deletePlaylist(s, id));
export const addPoem = (id: string, poemId: string) => updateSaved((s) => addToPlaylist(s, id, poemId));
export const togglePoem = (id: string, poemId: string) => updateSaved((s) => togglePoemInPlaylist(s, id, poemId));
export const removePoem = (id: string, poemId: string) => updateSaved((s) => removeFromPlaylist(s, id, poemId));
export const move = (id: string, from: number, to: number) => updateSaved((s) => movePoem(s, id, from, to));

/** A playlist's name, or the name of one left without. */
export const playlistName = (p: Pick<Playlist, "name">, lang: UiLang) => p.name || t(lang, "untitled");

/**
 * Plays `ids` in order from `from`, as if the reader had opened that poem from this list: the mini
 * player shows it at once, and the rest follow when it ends.
 */
export function playList(ids: readonly string[], lang: UiLang, from = 0) {
  const id = ids[from];
  const entry = id ? catalogEntry(catalogNow(), id, lang) : null;
  if (!id || !entry) return;
  rememberList(id, ids);
  player.play(entry as NowItem);
}
