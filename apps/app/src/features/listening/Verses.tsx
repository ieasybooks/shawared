import { FOLLOW_RESUME_MS, space } from "@shawared/design";
import { segmentAt } from "@shawared/listening";
import { LinearGradient } from "expo-linear-gradient";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type HostInstance,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";
import { Dir } from "../../components/ui/Dir";
import { useSettings } from "../../lib/settings";
import { responsive, useLayout } from "../../lib/responsive";
import { useHydrated } from "../../lib/viewport";
import { BaytRow } from "./BaytRow";
import { useCurrentLine, usePlaying } from "./playback";
import { useCurrentBayt, useListening } from "./state";

/** The fades over the list's top and bottom edges. */
const FADE_TOP = 36;
const FADE_BOTTOM = 48;
/** When the list has to move, the bayt lands this far down it: room for what comes next. */
const READ_AT = 0.2;
/** Rows drawn with the page, enough to fill a tall screen; the rest follow a batch a frame. */
const FIRST_ROWS = 14;
const BATCH_ROWS = 24;

/**
 * How many rows to draw. Every row is a dozen elements and more, so drawing a long poem's
 * every row before showing any took 0.4 s on a laptop and over a second on a phone, with the
 * page empty meanwhile. A page moved to draws what fills the screen at once, then the rest a
 * batch a frame, out of the way of the reader (a transition). The page the browser opened is
 * drawn whole, as it was rendered ahead of time and as search engines read it. `upTo` is the
 * index of a row that must be there now: the playing or held bayt.
 */
function useShownRows(count: number, upTo: number): number {
  const hydrated = useHydrated();
  const [shown, setShown] = useState(() => (hydrated ? Math.min(count, Math.max(FIRST_ROWS, upTo + 4)) : count));
  useEffect(() => {
    if (shown >= count) return;
    const id = requestAnimationFrame(() => startTransition(() => setShown((n) => Math.min(count, n + BATCH_ROWS))));
    return () => cancelAnimationFrame(id);
  }, [shown, count]);
  return Math.max(shown, Math.min(count, upTo + 1));
}

/**
 * The verse list. Keeps the playing bayt in view, moving only when it nears an edge, and
 * stops doing so for FOLLOW_RESUME_MS after the reader scrolls (the Faqieh rule).
 */
export function Verses() {
  const { abyat, playback, pinned, followRef } = useListening();
  const { palette } = useSettings();
  const layout = useLayout();
  const current = useCurrentBayt();
  const line = useCurrentLine(playback);
  const lineInfo = playback.track.lines[line];
  const currentHalf = lineInfo ? lineInfo.half : null;
  const started = line >= 0;
  const playing = usePlaying(playback);
  const shown = useShownRows(
    abyat.length,
    Math.max(
      abyat.findIndex((b) => b.n === current),
      abyat.findIndex((b) => b.n === pinned),
    ),
  );

  const scroll = useRef<ScrollViewInstance>(null);
  const list = useRef<HostInstance>(null);
  const rows = useRef(new Map<number, HostInstance>());
  const viewport = useRef(0);
  const contentH = useRef(0);
  const scrollY = useRef(0);
  const listY = useRef<number | null>(null);
  // Each fade shows only while there is more to scroll that way, so the list needs no padding for it.
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const updateEdges = useCallback(() => {
    const max = contentH.current - viewport.current;
    const next = { top: scrollY.current > 2, bottom: scrollY.current < max - 2 };
    setEdges((e) => (e.top === next.top && e.bottom === next.bottom ? e : next));
  }, []);
  const userUntil = useRef(0);
  const programmatic = useRef<{ until: number; y: number } | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentRef = useRef(current);
  const playingRef = useRef(playing);
  useEffect(() => {
    currentRef.current = current;
    playingRef.current = playing;
  });

  const revealBayt = useCallback((r: { y: number; h: number }, animated: boolean) => {
    const vh = viewport.current;
    if (!vh || !contentH.current || listY.current === null) return false;
    // Where the list is, or is about to be while a scroll of ours is under way.
    const p = programmatic.current;
    const at = p && Date.now() < p.until ? p.y : scrollY.current;
    const top = listY.current + r.y - at;
    const edgeTop = Math.max(FADE_TOP + space.m, vh * 0.1);
    const edgeBottom = vh - Math.max(FADE_BOTTOM + space.m, vh * 0.1);
    if (top >= edgeTop && top + r.h <= edgeBottom) return true;
    const max = contentH.current > vh ? contentH.current - vh : Infinity;
    const y = Math.min(max, Math.max(0, listY.current + r.y - Math.max(edgeTop, vh * READ_AT)));
    if (Math.abs(y - at) < 1) return true;
    programmatic.current = { until: Date.now() + (animated ? 1200 : 150), y };
    scroll.current?.scrollTo({ y, animated });
    return true;
  }, []);

  const pending = useRef<{ n: number; animated: boolean } | null>(null);
  const revealFrame = useRef<number | undefined>(undefined);
  const requestReveal = useCallback(
    (n: number, animated: boolean) => {
      pending.current = { n, animated: animated || (pending.current?.n === n && pending.current.animated) };
      if (revealFrame.current !== undefined) return;
      revealFrame.current = requestAnimationFrame(() => {
        revealFrame.current = undefined;
        if (Date.now() < userUntil.current) {
          pending.current = null;
          return;
        }
        const request = pending.current;
        const node = request && rows.current.get(request.n);
        const container = list.current;
        if (!request || !node || !container) return;
        node.measureLayout(container, (_x, y, _w, h) => {
          if (pending.current !== request || Date.now() < userUntil.current || h <= 0) return;
          if (revealBayt({ y, h }, request.animated)) pending.current = null;
        });
      });
    },
    [revealBayt],
  );
  const layoutChanged = useCallback(() => {
    requestReveal(pending.current?.n ?? currentRef.current, false);
  }, [requestReveal]);

  // Read the bayt from the clock, not from render: a seek has just moved it.
  const follow = useCallback(() => {
    clearTimeout(resumeTimer.current);
    userUntil.current = 0;
    const { track, clock } = playback;
    requestReveal(track.segments[segmentAt(track, clock.get().time)]?.n ?? currentRef.current, true);
  }, [requestReveal, playback]);
  useEffect(() => {
    followRef.current = follow;
    return () => {
      if (followRef.current === follow) followRef.current = null;
    };
  }, [follow, followRef]);

  const userScrolled = useCallback(() => {
    userUntil.current = Date.now() + FOLLOW_RESUME_MS;
    programmatic.current = null;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      userUntil.current = 0;
      if (playingRef.current) requestReveal(currentRef.current, true);
    }, FOLLOW_RESUME_MS);
  }, [requestReveal]);

  useEffect(
    () => () => {
      clearTimeout(resumeTimer.current);
      if (revealFrame.current !== undefined) cancelAnimationFrame(revealFrame.current);
      revealFrame.current = undefined;
      pending.current = null;
    },
    [],
  );

  useEffect(() => {
    if (Date.now() >= userUntil.current) requestReveal(current, true);
  }, [current, requestReveal]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = programmatic.current;
    const y = e.nativeEvent.contentOffset.y;
    scrollY.current = y;
    updateEdges();
    if (p && Date.now() < p.until) {
      if (Math.abs(y - p.y) < 2) programmatic.current = null;
      return;
    }
    // Resizing content can clamp or anchor its offset without any reader input.
    if (Date.now() < userUntil.current) userScrolled();
  };

  const webScrollIntent =
    Platform.OS === "web"
      ? {
          onWheel: (e: { nativeEvent: { deltaY: number } }) => {
            if (e.nativeEvent.deltaY !== 0) userScrolled();
          },
          onTouchMove: userScrolled,
          onKeyDown: (e: { nativeEvent: { key: string } }) => {
            if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.nativeEvent.key)) userScrolled();
          },
        }
      : {};

  const rowRef = useCallback((n: number, node: HostInstance | null) => {
    if (node) rows.current.set(n, node);
    else rows.current.delete(n);
  }, []);

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={layout.style(listPadding)}
        onLayout={(e) => {
          viewport.current = e.nativeEvent.layout.height;
          updateEdges();
          layoutChanged();
        }}
        onContentSizeChange={(_, h) => {
          contentH.current = h;
          updateEdges();
          layoutChanged();
        }}
        onScroll={onScroll}
        onScrollBeginDrag={userScrolled}
        {...webScrollIntent}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="verses"
      >
        <Dir
          ref={list}
          dir="rtl"
          lang="ar"
          onLayout={(e) => {
            listY.current = e.nativeEvent.layout.y;
            layoutChanged();
          }}
        >
          {abyat.slice(0, shown).map((b) => (
            <BaytRow
              key={b.n}
              bayt={b}
              onLayout={layoutChanged}
              rowRef={rowRef}
              isCurrent={started ? b.n === current : false}
              currentHalf={started && b.n === current ? currentHalf : null}
              isPinned={pinned === b.n}
            />
          ))}
        </Dir>
      </ScrollView>
      {edges.top && <LinearGradient pointerEvents="none" colors={[palette.bg, `${palette.bg}00`]} style={[styles.fade, styles.fadeTop]} />}
      {edges.bottom && (
        <LinearGradient pointerEvents="none" colors={[`${palette.bg}00`, palette.bg]} style={[styles.fade, styles.fadeBottom]} />
      )}
    </View>
  );
}

const listPadding = responsive(
  { paddingBottom: space.xl, paddingStart: space.m, paddingEnd: space.m },
  { paddingBottom: space.xxl, paddingStart: 30, paddingEnd: 30 },
);

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0 },
  scroll: { flex: 1 },
  fade: { position: "absolute", left: 0, right: 0 },
  fadeTop: { top: 0, height: FADE_TOP },
  fadeBottom: { bottom: 0, height: FADE_BOTTOM },
});
