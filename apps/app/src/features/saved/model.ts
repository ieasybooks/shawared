import type { Catalog } from "@shawared/contracts";

export type FavouriteKind = "poems" | "poets" | "reciters";

export type Playlist = {
  id: string;
  name: string;
  /** Poem ids, in the order they play. */
  poems: string[];
};

export type Saved = {
  /** Favourite poems, newest first. */
  poems: string[];
  poets: string[];
  reciters: string[];
  /** Newest first. */
  playlists: Playlist[];
};

export const EMPTY: Saved = { poems: [], poets: [], reciters: [], playlists: [] };

export const NAME_MAX = 60;

const ids = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && x.length > 0))] : [];

/** Saved data as it was stored, read leniently: an older or damaged copy keeps what it can. */
export function parseSaved(raw: unknown): Saved {
  if (!raw || typeof raw !== "object") return EMPTY;
  const r = raw as Record<string, unknown>;
  const seen = new Set<string>();
  const playlists: Playlist[] = [];
  for (const p of Array.isArray(r.playlists) ? r.playlists : []) {
    if (!p || typeof p !== "object") continue;
    const { id, name, poems } = p as Record<string, unknown>;
    if (typeof id !== "string" || !id || seen.has(id)) continue;
    seen.add(id);
    playlists.push({ id, name: typeof name === "string" ? cleanName(name) : "", poems: ids(poems) });
  }
  return { poems: ids(r.poems), poets: ids(r.poets), reciters: ids(r.reciters), playlists };
}

export const isFavourite = (s: Saved, kind: FavouriteKind, id: string) => s[kind].includes(id);

export function toggleFavourite(s: Saved, kind: FavouriteKind, id: string): Saved {
  const list = s[kind];
  return { ...s, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [id, ...list] };
}

/** A name as typed: spaces trimmed and collapsed, at most NAME_MAX characters. */
export function cleanName(name: string): string {
  return [...name.replace(/\s+/g, " ").trim()].slice(0, NAME_MAX).join("").trim();
}

/** An id for a new playlist, unique on this device. */
export function newPlaylistId(now = Date.now(), random = Math.random()): string {
  return `${now.toString(36)}${Math.floor(random * 36 ** 4)
    .toString(36)
    .padStart(4, "0")}`;
}

export const playlistOf = (s: Saved, id: string) => s.playlists.find((p) => p.id === id);

function updatePlaylist(s: Saved, id: string, fn: (p: Playlist) => Playlist): Saved {
  if (!playlistOf(s, id)) return s;
  return { ...s, playlists: s.playlists.map((p) => (p.id === id ? fn(p) : p)) };
}

/** A new playlist at the top, holding `poems`. An empty name stays empty: the app shows a default. */
export function createPlaylist(s: Saved, id: string, name: string, poems: string[] = []): Saved {
  if (playlistOf(s, id)) return s;
  return { ...s, playlists: [{ id, name: cleanName(name), poems: [...new Set(poems)] }, ...s.playlists] };
}

export const renamePlaylist = (s: Saved, id: string, name: string) => updatePlaylist(s, id, (p) => ({ ...p, name: cleanName(name) }));

export const deletePlaylist = (s: Saved, id: string): Saved => ({ ...s, playlists: s.playlists.filter((p) => p.id !== id) });

export const addToPlaylist = (s: Saved, id: string, poemId: string) =>
  updatePlaylist(s, id, (p) => (p.poems.includes(poemId) ? p : { ...p, poems: [...p.poems, poemId] }));

export const removeFromPlaylist = (s: Saved, id: string, poemId: string) =>
  updatePlaylist(s, id, (p) => ({ ...p, poems: p.poems.filter((x) => x !== poemId) }));

export const togglePoemInPlaylist = (s: Saved, id: string, poemId: string) =>
  playlistOf(s, id)?.poems.includes(poemId) ? removeFromPlaylist(s, id, poemId) : addToPlaylist(s, id, poemId);

/** Move toward a visible neighbor; withdrawn poems keep their stored identities. */
export function movePoem(s: Saved, id: string, poemId: string, neighborId: string | undefined): Saved {
  return updatePlaylist(s, id, (p) => {
    const from = p.poems.indexOf(poemId);
    const to = neighborId === undefined ? -1 : p.poems.indexOf(neighborId);
    if (from < 0 || to < 0 || from === to) return p;
    const poems = [...p.poems];
    const [poem] = poems.splice(from, 1);
    poems.splice(to, 0, poem!);
    return { ...p, poems };
  });
}

export function playlistContent(playlist: Playlist, catalog: Catalog) {
  const known = new Map(catalog.poems.map((poem) => [poem.id, poem]));
  const poems = playlist.poems.flatMap((id) => {
    const poem = known.get(id);
    return poem ? [poem] : [];
  });
  return {
    poems,
    ids: poems.map((poem) => poem.id),
    seconds: poems.reduce((sum, poem) => sum + (poem.recitations[0]?.duration ?? 0), 0),
  };
}
