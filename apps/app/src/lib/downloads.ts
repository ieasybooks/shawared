// Recordings downloaded to listen to offline (the apps only; downloads.web.ts is the web's).
//
// Each recording is a file under the app's documents, at its audio key ("<poem>/<reciter>.<hash>.m4a"),
// so a recording published again under a new key is a new file. Downloading one also keeps its
// poem's text in the content cache (lib/diskCache), so the poem's page opens offline, and the
// lock screen's picture, so it shows offline too. The player plays a downloaded recording from
// its file (`localAudio`).
import type { Catalog } from "@shawared/contracts";
import { Directory, File, Paths } from "expo-file-system";
import { ARTWORK_URL, audioUrl, loadPoem } from "./content";
import { createStore } from "./store";

export const canDownload = true;

export type Downloads = {
  /** The recordings on the device, by audio key, with their size in bytes. */
  done: Record<string, number>;
  /** Recordings downloading, by audio key: how far, from 0 to 1, or -1 when the size isn't known. */
  active: Record<string, number>;
};

export const downloadsStore = createStore<Downloads>({ done: {}, active: {} });

const root = new Directory(Paths.document, "audio");
const artwork = new File(Paths.document, "artwork.png");
const PART = ".part";

const fileOf = (key: string) => new File(root, ...key.split("/"));
const poemOf = (key: string) => key.split("/")[0]!;

let scanned = false;

/** Reads which recordings are on the device, once. */
export function scanDownloads() {
  if (scanned) return;
  scanned = true;
  const done: Record<string, number> = {};
  try {
    if (root.exists)
      for (const dir of root.list())
        if (dir instanceof Directory)
          for (const f of dir.list()) {
            // A download cut short leaves its part behind: it goes.
            if (f instanceof File && f.name.endsWith(PART)) f.delete();
            else if (f instanceof File) done[`${dir.name}/${f.name}`] = f.size;
          }
  } catch {
    // An unreadable folder: as if nothing were downloaded.
  }
  downloadsStore.set({ done });
}

/** A downloaded recording's file, to play instead of fetching it. */
export function localAudio(key: string): string | null {
  scanDownloads();
  return downloadsStore.get().done[key] === undefined ? null : fileOf(key).uri;
}

/** The lock screen's picture: the copy on the device once a recording was downloaded. */
export function artworkUrl(): string {
  return downloadedArtwork ? artwork.uri : ARTWORK_URL;
}

let downloadedArtwork = (() => {
  try {
    return artwork.exists;
  } catch {
    return false;
  }
})();

async function keepArtwork() {
  if (downloadedArtwork) return;
  try {
    await File.downloadFileAsync(ARTWORK_URL, artwork, { idempotent: true });
    downloadedArtwork = true;
  } catch {
    // The lock screen fetches it while online.
  }
}

function setActive(key: string, progress: number | null) {
  const { [key]: _, ...rest } = downloadsStore.get().active;
  downloadsStore.set({ active: progress === null ? rest : { ...rest, [key]: progress } });
}

const aborts = new Map<string, AbortController>();

/**
 * Downloads a poem's recording, with its text in `langs`. Resolves to whether it's on the device.
 * Other recordings of the poem (an older cut) are removed once this one is here.
 */
export async function download(poemId: string, key: string, langs: readonly string[]): Promise<boolean> {
  scanDownloads();
  const { done, active } = downloadsStore.get();
  if (done[key] !== undefined) return true;
  if (active[key] !== undefined) return false;
  setActive(key, 0);
  const abort = new AbortController();
  aborts.set(key, abort);
  const target = fileOf(key);
  const part = new File(root, poemOf(key), `${target.name}${PART}`);
  try {
    new Directory(root, poemOf(key)).create({ intermediates: true, idempotent: true });
    const texts = Promise.all(langs.map((lang) => loadPoem(poemId, lang)));
    await File.downloadFileAsync(audioUrl(key), part, {
      idempotent: true,
      signal: abort.signal,
      onProgress: ({ bytesWritten, totalBytes }) => {
        if (aborts.get(key) === abort) setActive(key, totalBytes > 0 ? Math.min(1, bytesWritten / totalBytes) : -1);
      },
    });
    await texts;
    if (target.exists) target.delete();
    part.rename(target.name);
    const size = fileOf(key).size;
    downloadsStore.set({ done: { ...downloadsStore.get().done, [key]: size } });
    for (const other of Object.keys(downloadsStore.get().done)) if (other !== key && poemOf(other) === poemOf(key)) remove(other);
    void keepArtwork();
    return true;
  } catch {
    try {
      if (part.exists) part.delete();
    } catch {
      // The next scan removes it.
    }
    return false;
  } finally {
    if (aborts.get(key) === abort) aborts.delete(key);
    setActive(key, null);
  }
}

/** Stops a download. */
export function cancel(key: string) {
  aborts.get(key)?.abort();
}

/** Deletes a downloaded recording. */
export function remove(key: string) {
  try {
    const f = fileOf(key);
    if (f.exists) f.delete();
  } catch {
    // Still listed until it's gone; the next scan finds out.
    return;
  }
  const { [key]: _, ...done } = downloadsStore.get().done;
  downloadsStore.set({ done });
}

let refreshed = false;

/**
 * Keeps downloads in step with the catalog, once a session: a poem published again with a new
 * recording downloads that one in place of the old, and recordings of poems the catalog no longer
 * has are removed.
 */
export async function refreshDownloads(catalog: Catalog) {
  if (refreshed) return;
  refreshed = true;
  scanDownloads();
  const current = new Map(catalog.poems.map((p) => [p.id, p] as const));
  for (const key of Object.keys(downloadsStore.get().done)) {
    const poem = current.get(poemOf(key));
    const now = poem?.recitations[0]?.audio;
    if (!poem) remove(key);
    else if (now && now !== key) await download(poem.id, now, poem.langs);
  }
}
