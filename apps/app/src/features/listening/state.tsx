import type { PoemBundle, PublishedBayt, PublishedRecitation, PublishedSource } from "@shawared/contracts";
import { startOfBayt, wordIndex, type WordHit } from "@shawared/listening";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { isWide } from "../../lib/responsive";
import { nowItemOf, type NowItem } from "../player/player";
import { useCurrentSegment, usePlaying, usePoemPlayback, type Playback } from "./playback";

/** What the explanation holds: a bayt, the poem's introduction, or null to follow the recitation. */
export type Held = number | "intro" | null;

type ListeningValue = {
  bundle: PoemBundle;
  recitation: PublishedRecitation;
  playback: Playback;
  abyat: PublishedBayt[];
  /** All sources in the reader's language; the chosen one first in `ordered`. */
  sources: PublishedSource[];
  source: PublishedSource | undefined;
  ordered: PublishedSource[];
  setSourceId: (id: string) => void;
  words: Map<string, WordHit>;
  hasTranslation: boolean;
  trOn: boolean;
  setTrOn: (on: boolean) => void;
  /** What the explanation is held on; null when it follows the recitation. */
  pinned: Held;
  pin: (n: number) => void;
  unpin: () => void;
  /** The poem's introduction in the reader's language, if it has one. */
  intro: string | undefined;
  hasAbout: boolean;
  showIntro: () => void;
  /** A word whose meaning the explanation brings forward ("n.h.w"); its bayt is held. */
  focus: string | null;
  openWord: (key: string, n: number) => void;
  /** Seek somewhere and go back to following: previous, next, the progress bar, a bayt number. */
  jump: (seconds: number) => void;
  playFrom: (n: number) => void;
  /** Set by the verse list: scroll back to the playing bayt and follow again. */
  followRef: RefObject<(() => void) | null>;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
};

const Ctx = createContext<ListeningValue | null>(null);

export function ListeningProvider({
  bundle,
  recitation,
  initialBayt,
  children,
}: {
  bundle: PoemBundle;
  recitation: PublishedRecitation;
  /** Opened from a link to one bayt: hold its explanation and start there. */
  initialBayt?: number | undefined;
  children: ReactNode;
}) {
  const item = useMemo<NowItem>(() => nowItemOf(bundle, recitation)!, [bundle, recitation]);
  const playback = usePoemPlayback(item);
  const sources = bundle.sources;
  const [sourceId, setSourceId] = useState<string | undefined>(sources[0]?.id);
  const source = sources.find((s) => s.id === sourceId) ?? sources[0];
  const ordered = useMemo(() => (source ? [source, ...sources.filter((s) => s !== source)] : sources), [source, sources]);
  const words = useMemo(() => wordIndex(ordered), [ordered]);
  const hasTranslation = useMemo(() => sources.some((s) => Object.values(s.abyat).some((a) => a.translation)), [sources]);
  const [trOn, setTrOn] = useState(true);
  const intro = source?.intro ?? sources.find((s) => s.intro)?.intro;
  const hasAbout = Boolean(intro || (bundle.poem.themes?.length ?? 0) > 1);
  // A poem opens on its introduction, before the recitation; a link to one bayt, or a
  // recitation already under way, opens on the verses.
  const [held, setHeld] = useState<Held>(initialBayt ?? (hasAbout && !playback.active ? "intro" : null));
  const pinned: Held = held === "intro" && !hasAbout ? null : held;
  const [focus, setFocus] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const followRef = useRef<(() => void) | null>(null);

  // The introduction the poem opens on gives way to the verses once the recitation starts.
  // One the reader asked for (the chip) stays until they choose otherwise, through pauses
  // and buffering alike.
  const opening = useRef(held === "intro");
  const hold = useCallback((h: Held, word: string | null = null) => {
    opening.current = false;
    setHeld(h);
    setFocus(word);
  }, []);
  const playing = usePlaying(playback);
  useEffect(() => {
    if (!playing || !opening.current) return;
    opening.current = false;
    setHeld((h) => (h === "intro" ? null : h));
  }, [playing]);

  const jump = useCallback(
    (seconds: number) => {
      hold(null);
      playback.seek(seconds);
      followRef.current?.();
    },
    [playback, hold],
  );
  // A link to one bayt: hold it, and wait there ready to play, unless this recitation is
  // already playing. On the web the link takes effect once the page is live.
  useEffect(() => {
    if (!initialBayt) return;
    hold(initialBayt);
    if (playback.active) return;
    const at = startOfBayt(playback.track, initialBayt);
    if (at !== null) playback.seek(at);
    // Only when the link does: not as playback changes.
  }, [initialBayt]);

  const playFrom = useCallback(
    (n: number) => {
      const at = startOfBayt(playback.track, n);
      if (at === null) return;
      jump(at);
      playback.play();
    },
    [playback, jump],
  );

  const value = useMemo<ListeningValue>(
    () => ({
      bundle,
      recitation,
      playback,
      abyat: bundle.poem.abyat,
      sources,
      source,
      ordered,
      setSourceId,
      words,
      hasTranslation,
      trOn: hasTranslation && trOn,
      setTrOn,
      pinned,
      pin: (n) => hold(n),
      unpin: () => hold(null),
      intro,
      hasAbout,
      // Phones open the explanation's sheet; wide windows show it beside the verses.
      showIntro: () => {
        hold("intro");
        if (!isWide()) setSheetOpen(true);
      },
      focus,
      openWord: (key, n) => {
        hold(n, key);
        if (!isWide()) setSheetOpen(true);
      },
      jump,
      playFrom,
      followRef,
      sheetOpen,
      setSheetOpen,
    }),
    [
      bundle,
      recitation,
      playback,
      sources,
      source,
      ordered,
      words,
      hasTranslation,
      trOn,
      pinned,
      intro,
      hasAbout,
      focus,
      hold,
      jump,
      playFrom,
      sheetOpen,
    ],
  );
  return <Ctx value={value}>{children}</Ctx>;
}

export function useListening() {
  const v = use(Ctx);
  if (!v) throw new Error("useListening outside ListeningProvider");
  return v;
}

/** The bayt being recited now; the first one before the recitation starts. */
export function useCurrentBayt() {
  const { playback, abyat } = useListening();
  const seg = useCurrentSegment(playback);
  return playback.track.segments[seg]?.n ?? abyat[0]!.n;
}
