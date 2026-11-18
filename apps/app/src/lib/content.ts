import { bundlePath, Catalog, catalogPath, PersonBundle, personPath, PoemBundle, type PersonKind } from "@shawared/contracts";
import Constants from "expo-constants";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import type { z } from "zod";
import { readCached, writeCached } from "./diskCache";
import { AUDIO_HOST, SITE } from "./routes";

// Published content and audio. On the web they're served next to the app. The apps' release
// builds read them from shawared.com and audio.shawared.com, as the web's release does; a dev
// build from the dev server it was loaded from.
const devHost = `http://${Constants.expoConfig?.hostUri ?? "localhost:8081"}`;
const native = (dev: string, release: string) => (__DEV__ ? `${devHost}${dev}` : release);
const CONTENT_URL = process.env.EXPO_PUBLIC_CONTENT_URL ?? (Platform.OS === "web" ? "/content" : native("/content", `${SITE}/content`));
const AUDIO_URL = process.env.EXPO_PUBLIC_AUDIO_URL ?? (Platform.OS === "web" ? "/audio" : native("/audio", AUDIO_HOST));

export const audioUrl = (key: string) => `${AUDIO_URL}/${key}`;

/** The picture lock screens and media notifications show with a recitation: the mark (public/artwork.png). */
export const ARTWORK_URL = Platform.OS === "web" ? "/artwork.png" : native("/artwork.png", `${SITE}/artwork.png`);

// Stale-while-revalidate: show what we have (memory, then the device), and ask the
// server once per session whether it changed. An unchanged file costs one 304.
type Entry = { data?: unknown; error?: Error; etag?: string; checked?: boolean };
const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();
const inflight = new Map<string, Promise<void>>();

function entry(path: string): Entry {
  let e = entries.get(path);
  if (!e) entries.set(path, (e = {}));
  return e;
}

function notify(path: string) {
  listeners.get(path)?.forEach((fn) => fn());
}

function set(path: string, patch: Entry) {
  entries.set(path, { ...entry(path), ...patch });
  notify(path);
}

async function revalidate(path: string, schema: z.ZodType) {
  const e = entry(path);
  const headers: Record<string, string> = e.etag ? { "If-None-Match": e.etag } : {};
  // The web lets the browser revalidate with its own HTTP cache.
  const init: RequestInit = Platform.OS === "web" ? { cache: "no-cache" } : { headers };
  try {
    const res = await fetch(`${CONTENT_URL}/${path}`, init);
    if (res.status === 304) return set(path, { checked: true });
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    const text = await res.text();
    const data = schema.parse(JSON.parse(text));
    const etag = res.headers.get("etag");
    set(path, { data, checked: true, ...(etag ? { etag } : {}) });
    await writeCached(path, text, etag);
  } catch (error) {
    // With data already on screen, a failed check changes nothing.
    if (entry(path).data === undefined) set(path, { error: error as Error });
  }
}

function load(path: string, schema: z.ZodType) {
  let p = inflight.get(path);
  if (p) return p;
  p = (async () => {
    if (entry(path).data === undefined) {
      const hit = await readCached(path);
      if (hit && entry(path).data === undefined) {
        try {
          set(path, { data: schema.parse(JSON.parse(hit.text)), ...(hit.etag ? { etag: hit.etag } : {}) });
        } catch {
          // An outdated or damaged copy: fetch a fresh one.
        }
      }
    }
    if (!entry(path).checked) await revalidate(path, schema);
  })().finally(() => inflight.delete(path));
  inflight.set(path, p);
  return p;
}

/**
 * Puts a file a page was rendered with (a web loader) into the cache. It was built with the
 * page, so it is as fresh as the page and needs no check.
 */
function seed(path: string, data: unknown) {
  const e = entry(path);
  if (e.data === undefined) entries.set(path, { ...e, data, checked: true });
}

export type Resource<T> = { data: T | undefined; error: Error | undefined; retry: () => void };

/**
 * A published file, kept fresh. `initial` is the whole file a page was rendered with;
 * `preview` is part of one (a page renders only the slice of the catalog it shows), on
 * screen until the whole file arrives.
 */
function useResource<S extends z.ZodType>(
  path: string | null,
  schema: S,
  { initial, preview }: { initial?: z.infer<S> | undefined; preview?: z.infer<S> | undefined } = {},
): Resource<z.infer<S>> {
  // Rendering web pages ahead of time: many pages in one process, so it only reads what it's given.
  const server = Platform.OS === "web" && typeof window === "undefined";
  if (path && initial !== undefined && !server) seed(path, initial);
  const subscribe = useCallback(
    (fn: () => void) => {
      if (!path) return () => {};
      let subs = listeners.get(path);
      if (!subs) listeners.set(path, (subs = new Set()));
      subs.add(fn);
      return () => subs.delete(fn);
    },
    [path],
  );
  const get = useCallback(() => (path ? entries.get(path) : undefined), [path]);
  const e = useSyncExternalStore(subscribe, get, get);

  // Loading and revalidating talk to the network and the disk, outside React.
  useEffect(() => {
    if (path) load(path, schema);
  }, [path, schema]);

  const retry = useCallback(() => {
    if (!path) return;
    set(path, { error: undefined, checked: false });
    load(path, schema);
  }, [path, schema]);

  const data = (server ? undefined : (e?.data as z.infer<S> | undefined)) ?? initial ?? preview;
  return { data, error: data === undefined ? e?.error : undefined, retry };
}

/** The whole catalog if it's here, without waiting for it (the player queues from it). */
export const catalogNow = () => entries.get(catalogPath())?.data as Catalog | undefined;

/** The whole catalog, loading it if it isn't here; undefined if it can't be loaded. */
export const loadCatalog = () => load(catalogPath(), Catalog).then(catalogNow);

/** A poem's bundle in `lang`, loading it if it isn't here; undefined if it can't be loaded. */
export const loadPoem = (id: string, lang: string) =>
  load(bundlePath(id, lang), PoemBundle).then(() => entries.get(bundlePath(id, lang))?.data as PoemBundle | undefined);

/** The catalog. A page's slice of it shows until the whole catalog is here. */
export const useCatalog = (preview?: Catalog) => useResource(catalogPath(), Catalog, { preview });

export const usePoemBundle = (id: string | undefined, lang: string, initial?: PoemBundle) =>
  useResource(id ? bundlePath(id, lang) : null, PoemBundle, { initial });

export const usePerson = (kind: PersonKind, id: string | undefined, lang: string, initial?: PersonBundle) =>
  useResource(id ? personPath(kind, id, lang) : null, PersonBundle, { initial });

/**
 * Starts loading the file the page at `href` opens with (a poem, a poet, a reciter, in `lang`),
 * so that the page usually has it by the time it opens. Other addresses need nothing.
 */
export function prefetchPage(href: string, lang: string) {
  const m = /^(?:\/en)?\/(poems|poets|reciters)\/([^/?#]+)/.exec(href);
  if (!m) return;
  const [, kind, id] = m as unknown as [string, "poems" | PersonKind, string];
  if (kind === "poems") void load(bundlePath(id, lang), PoemBundle);
  else void load(personPath(kind, id, lang), PersonBundle);
}
