import { useCallback, useSyncExternalStore } from "react";

/** A tiny external store, so fast-changing values (the playback clock) re-render only what reads them. */
export type Store<T> = {
  get: () => T;
  set: (patch: Partial<T>) => void;
  subscribe: (fn: () => void) => () => void;
};

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    set(patch) {
      let changed = false;
      for (const k in patch) if (!Object.is(patch[k], state[k])) changed = true;
      if (!changed) return;
      state = { ...state, ...patch };
      subs.forEach((fn) => fn());
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

export function useStore<T, S>(store: Store<T>, select: (s: T) => S): S {
  const get = useCallback(() => select(store.get()), [store, select]);
  return useSyncExternalStore(store.subscribe, get, get);
}
