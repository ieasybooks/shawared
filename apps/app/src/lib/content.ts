import { bundlePath, Catalog, catalogPath, PoemBundle } from "@shawared/contracts";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import type { z } from "zod";

// Published content and audio. On the web they're served next to the app; native builds
// point at the dev server for now, and at the content host once it exists.
const devHost = "http://localhost:8081";
const CONTENT_URL = process.env.EXPO_PUBLIC_CONTENT_URL ?? (Platform.OS === "web" ? "/content" : `${devHost}/content`);
const AUDIO_URL = process.env.EXPO_PUBLIC_AUDIO_URL ?? (Platform.OS === "web" ? "/audio" : `${devHost}/audio`);

export const audioUrl = (key: string) => `${AUDIO_URL}/${key}`;

const cache = new Map<string, Promise<unknown>>();

function load<S extends z.ZodType>(path: string, schema: S): Promise<z.infer<S>> {
  let p = cache.get(path) as Promise<z.infer<S>> | undefined;
  if (!p) {
    p = fetch(`${CONTENT_URL}/${path}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${path}`);
        return r.json();
      })
      .then((json) => schema.parse(json));
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p;
}

export type Resource<T> = { data: T | undefined; error: Error | undefined; retry: () => void };

function useResource<T>(key: string | null, fetcher: () => Promise<T>): Resource<T> {
  const [state, setState] = useState<{ key: string | null; data?: T; error?: Error }>({ key: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!key) return;
    let live = true;
    fetcher().then(
      (data) => live && setState({ key, data }),
      (error: Error) => live && setState({ key, error }),
    );
    return () => {
      live = false;
    };
  }, [key, attempt]);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const current = state.key === key;
  return { data: current ? state.data : undefined, error: current ? state.error : undefined, retry };
}

export const useCatalog = () => useResource(catalogPath(), () => load(catalogPath(), Catalog));

export const usePoemBundle = (id: string | undefined, lang: string) => {
  const path = id ? bundlePath(id, lang) : null;
  return useResource(path, () => load(path!, PoemBundle));
};
