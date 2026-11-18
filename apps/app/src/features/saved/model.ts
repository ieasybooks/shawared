// What the reader keeps: favourite poems, poets and reciters, and playlists of their own. It all
// stays on the device (lib/saved.ts stores it). These are the rules, pure, so they are tested
// without storage or React.

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

/** A playlist's name at most this long. */
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

/** Adds `id` to the front of the favourites, or takes it out. */
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

/** Puts a poem at the end of a playlist, unless it's in it already. */
export const addToPlaylist = (s: Saved, id: string, poemId: string) =>
  updatePlaylist(s, id, (p) => (p.poems.includes(poemId) ? p : { ...p, poems: [...p.poems, poemId] }));

export const removeFromPlaylist = (s: Saved, id: string, poemId: string) =>
  updatePlaylist(s, id, (p) => ({ ...p, poems: p.poems.filter((x) => x !== poemId) }));

/** Adds the poem to the playlist, or takes it out if it's there. */
export const togglePoemInPlaylist = (s: Saved, id: string, poemId: string) =>
  playlistOf(s, id)?.poems.includes(poemId) ? removeFromPlaylist(s, id, poemId) : addToPlaylist(s, id, poemId);

/** Moves the poem at `from` to `to` (indexes in the playlist). */
export function movePoem(s: Saved, id: string, from: number, to: number): Saved {
  return updatePlaylist(s, id, (p) => {
    if (from < 0 || from >= p.poems.length || to < 0 || to >= p.poems.length || from === to) return p;
    const poems = [...p.poems];
    const [poem] = poems.splice(from, 1);
    poems.splice(to, 0, poem!);
    return { ...p, poems };
  });
}

/** The poems of `ids` the catalog still has, in order (a poem can be withdrawn after it was saved). */
export function present(ids: readonly string[], known: (id: string) => boolean): string[] {
  return ids.filter(known);
}
