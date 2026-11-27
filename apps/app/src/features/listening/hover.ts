import { createStore } from "../../lib/store";

const OPEN_MS = 450;
const CLOSE_MS = 150;
const WARM_MS = 400;

export type WordRect = { x: number; y: number; w: number; h: number };
export type WordPeekState = { key: string | null; rect: WordRect | null };

/** Hover belongs to one poem page, including its delayed opening and warm transitions. */
export function createListeningHover() {
  const bayt = createStore<{ n: number | null }>({ n: null });
  const word = createStore<WordPeekState>({ key: null, rect: null });
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let warmUntil = 0;

  const hideWord = () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    word.set({ key: null, rect: null });
  };

  return {
    bayt,
    word,
    hideWord,
    enterWord(key: string, measure: () => WordRect) {
      clearTimeout(closeTimer);
      if (word.get().key === key) return;
      const show = () => word.set({ key, rect: measure() });
      clearTimeout(openTimer);
      if (word.get().key || performance.now() < warmUntil) show();
      else openTimer = setTimeout(show, OPEN_MS);
    },
    leaveWord() {
      clearTimeout(openTimer);
      if (!word.get().key) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        warmUntil = performance.now() + WARM_MS;
        word.set({ key: null, rect: null });
      }, CLOSE_MS);
    },
    reset() {
      hideWord();
      bayt.set({ n: null });
      warmUntil = 0;
    },
  };
}

export type ListeningHover = ReturnType<typeof createListeningHover>;
