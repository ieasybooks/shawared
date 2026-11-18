// The reader's favourites and playlists, kept on the device: AsyncStorage in the apps,
// localStorage on the web. Nothing leaves it. The rules are in features/saved/model.ts.
//
// Web pages are rendered ahead of time with nothing saved, so the browser reads what it has
// only once the page is live (the first `useSaved` effect), and the page then shows it.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import { EMPTY, parseSaved, type Saved } from "../features/saved/model";
import { createStore, useStore } from "./store";

export const SAVED_KEY = "shawared.saved.v1";

/** What is saved, and whether it has been read from storage yet. */
export const savedStore = createStore<{ loaded: boolean; data: Saved }>({ loaded: false, data: EMPTY });

let reading: Promise<void> | null = null;

async function read() {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    return raw ? parseSaved(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Reads what is saved, once. */
export function restoreSaved(): Promise<void> {
  reading ??= (async () => {
    const data = await read();
    savedStore.set({ loaded: true, data });
    // Another tab of the site changed it.
    if (Platform.OS === "web" && typeof window !== "undefined")
      window.addEventListener("storage", (e) => {
        if (e.key === SAVED_KEY) void read().then((next) => savedStore.set({ data: next }));
      });
  })();
  return reading;
}

let writing = Promise.resolve();

/**
 * Changes what is saved and stores it. A change made before storage is read waits for it, so
 * it never writes over what was there.
 */
export function updateSaved(change: (s: Saved) => Saved): Promise<void> {
  const run = async () => {
    await restoreSaved();
    const before = savedStore.get().data;
    const data = change(before);
    if (data === before) return;
    savedStore.set({ data });
    try {
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(data));
    } catch {
      // A full disk only costs this change after the app closes.
    }
  };
  // One change at a time, in order.
  writing = writing.then(run, run);
  return writing;
}

/**
 * Part of what is saved. `select` must return something already in it (an array, a playlist)
 * or a plain value: a new array on every call would re-render forever.
 */
export function useSaved<S>(select: (s: Saved) => S): S {
  useEffect(() => void restoreSaved(), []);
  const pick = useCallback((s: { data: Saved }) => select(s.data), [select]);
  return useStore(savedStore, pick);
}

const selectLoaded = (s: { loaded: boolean }) => s.loaded;

/** Whether storage has been read: until then, lists of saved things show nothing rather than "none". */
export function useSavedLoaded(): boolean {
  useEffect(() => void restoreSaved(), []);
  return useStore(savedStore, selectLoaded);
}
