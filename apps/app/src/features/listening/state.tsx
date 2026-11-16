import type { PoemBundle, PublishedBayt, PublishedRecitation, PublishedSource } from "@shawared/contracts";
import { PRE_ROLL, REPEAT_GAP, segmentAt, startOfBayt, wordIndex, type WordHit } from "@shawared/listening";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useCurrentSegment, usePlayback, type Playback } from "./playback";

export type Layout = "compact" | "wide";
export type Gloss = { key: string; n: number; half: 1 | 2 };

type ListeningValue = {
  bundle: PoemBundle;
  recitation: PublishedRecitation;
  playback: Playback;
  layout: Layout;
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
  /** The bayt the explanation is held on, or null when it follows the recitation. */
  pinned: number | null;
  pin: (n: number) => void;
  unpin: () => void;
  gloss: Gloss | null;
  openGloss: (g: Gloss) => void;
  closeGloss: () => void;
  repeat: boolean;
  setRepeat: (on: boolean) => void;
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
  layout,
  children,
}: {
  bundle: PoemBundle;
  recitation: PublishedRecitation;
  layout: Layout;
  children: ReactNode;
}) {
  const playback = usePlayback(recitation);
  const sources = bundle.sources;
  const [sourceId, setSourceId] = useState<string | undefined>(sources[0]?.id);
  const source = sources.find((s) => s.id === sourceId) ?? sources[0];
  const ordered = useMemo(() => (source ? [source, ...sources.filter((s) => s !== source)] : sources), [source, sources]);
  const words = useMemo(() => wordIndex(ordered), [ordered]);
  const hasTranslation = useMemo(() => sources.some((s) => Object.values(s.abyat).some((a) => a.translation)), [sources]);
  const [trOn, setTrOn] = useState(true);
  const [pinned, setPinned] = useState<number | null>(null);
  const [gloss, setGloss] = useState<Gloss | null>(null);
  const [repeat, setRepeat] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const followRef = useRef<(() => void) | null>(null);

  const jump = useCallback(
    (seconds: number) => {
      setPinned(null);
      playback.seek(seconds);
      followRef.current?.();
    },
    [playback],
  );
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
      layout,
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
      pin: setPinned,
      unpin: () => setPinned(null),
      gloss,
      openGloss: setGloss,
      closeGloss: () => setGloss(null),
      repeat,
      setRepeat,
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
      layout,
      sources,
      source,
      ordered,
      words,
      hasTranslation,
      trOn,
      pinned,
      gloss,
      repeat,
      jump,
      playFrom,
      sheetOpen,
    ],
  );
  return (
    <Ctx value={value}>
      {repeat && <RepeatWatcher playback={playback} />}
      {children}
    </Ctx>
  );
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

/** With repeat on, loops the bayt being recited. Any seek by the reader re-aims it. */
function RepeatWatcher({ playback }: { playback: Playback }) {
  useEffect(() => {
    const { clock, track } = playback;
    let locked = -1;
    let seq = -1;
    return clock.subscribe(() => {
      const { time, playing, seq: now } = clock.get();
      if (!playing) return;
      if (now !== seq || !track.segments[locked]) {
        locked = segmentAt(track, time);
        seq = now;
      }
      const seg = track.segments[locked];
      if (!seg) return;
      const next = track.segments[locked + 1];
      const gap = next ? Math.min(REPEAT_GAP, Math.max(0, next.start - seg.end - 0.05)) : REPEAT_GAP;
      if (time >= seg.end + gap) {
        playback.seek(Math.max(0, seg.start - PRE_ROLL));
        seq = clock.get().seq;
      }
    });
  }, [playback]);
  return null;
}
