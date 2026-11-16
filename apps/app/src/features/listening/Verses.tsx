import { FOLLOW_RESUME_MS } from "@shawared/design";
import { segmentAt } from "@shawared/listening";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";
import { Dir } from "../../components/ui/Dir";
import { useSettings } from "../../lib/settings";
import { BaytRow } from "./BaytRow";
import { useCurrentLine, usePlaying } from "./playback";
import { useCurrentBayt, useListening } from "./state";

/**
 * The verse list. Keeps the playing bayt centred, and stops doing so for
 * FOLLOW_RESUME_MS after the reader scrolls (the Faqieh rule).
 */
export function Verses() {
  const { abyat, playback, layout, pinned, trOn, followRef } = useListening();
  const { palette, lang } = useSettings();
  const current = useCurrentBayt();
  const line = useCurrentLine(playback);
  const lineInfo = playback.track.lines[line];
  const currentHalf = lineInfo ? lineInfo.half : null;
  const started = line >= 0;
  const playing = usePlaying(playback);

  const scroll = useRef<ScrollViewInstance>(null);
  const rows = useRef(new Map<number, { y: number; h: number }>());
  const viewport = useRef(0);
  const listY = useRef(0);
  const userUntil = useRef(0);
  const programmatic = useRef<{ until: number; y: number } | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentRef = useRef(current);
  const playingRef = useRef(playing);
  useEffect(() => {
    currentRef.current = current;
    playingRef.current = playing;
  });

  const scrollToBayt = useCallback((n: number, animated: boolean) => {
    const r = rows.current.get(n);
    if (!r || !viewport.current) return;
    const y = Math.max(0, listY.current + r.y - (viewport.current - r.h) / 2);
    programmatic.current = { until: Date.now() + (animated ? 1200 : 150), y };
    scroll.current?.scrollTo({ y, animated });
  }, []);

  // Read the bayt from the clock, not from render: a seek has just moved it.
  const follow = useCallback(() => {
    clearTimeout(resumeTimer.current);
    userUntil.current = 0;
    const { track, clock } = playback;
    scrollToBayt(track.segments[segmentAt(track, clock.get().time)]?.n ?? currentRef.current, true);
  }, [scrollToBayt, playback]);
  useEffect(() => {
    followRef.current = follow;
  }, [follow, followRef]);

  const userScrolled = useCallback(() => {
    userUntil.current = Date.now() + FOLLOW_RESUME_MS;
    programmatic.current = null;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      userUntil.current = 0;
      if (playingRef.current) scrollToBayt(currentRef.current, true);
    }, FOLLOW_RESUME_MS);
  }, [scrollToBayt]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  // Follow the recitation from bayt to bayt.
  useEffect(() => {
    if (Date.now() >= userUntil.current) scrollToBayt(current, true);
  }, [current, scrollToBayt]);

  // The translation switch and the language change every row's height: keep the playing bayt in view.
  useEffect(() => {
    const id = setTimeout(() => {
      if (Date.now() >= userUntil.current) scrollToBayt(currentRef.current, false);
    }, 120);
    return () => clearTimeout(id);
  }, [trOn, lang, layout, scrollToBayt]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = programmatic.current;
    const y = e.nativeEvent.contentOffset.y;
    if (p && Date.now() < p.until) {
      if (Math.abs(y - p.y) < 2) programmatic.current = null;
      return;
    }
    userScrolled();
  };

  const onRowLayout = useCallback(
    (n: number, e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      const first = rows.current.size === 0;
      rows.current.set(n, { y, h: height });
      if (first) requestAnimationFrame(() => scrollToBayt(currentRef.current, false));
    },
    [scrollToBayt],
  );

  const wide = layout === "wide";
  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={wide ? styles.contentWide : styles.content}
        onLayout={(e) => (viewport.current = e.nativeEvent.layout.height)}
        onScroll={onScroll}
        onScrollBeginDrag={userScrolled}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="verses"
      >
        <Dir dir="rtl" lang="ar" onLayout={(e) => (listY.current = e.nativeEvent.layout.y)}>
          {abyat.map((b) => (
            <BaytRow
              key={b.n}
              bayt={b}
              onLayout={onRowLayout}
              isCurrent={started ? b.n === current : false}
              currentHalf={started && b.n === current ? currentHalf : null}
              isPinned={pinned === b.n}
            />
          ))}
        </Dir>
      </ScrollView>
      <LinearGradient pointerEvents="none" colors={[palette.bg, `${palette.bg}00`]} style={[styles.fade, styles.fadeTop]} />
      <LinearGradient pointerEvents="none" colors={[`${palette.bg}00`, palette.bg]} style={[styles.fade, styles.fadeBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0 },
  scroll: { flex: 1 },
  content: { paddingTop: 34, paddingBottom: 60, paddingHorizontal: 12 },
  contentWide: { paddingTop: 34, paddingBottom: 90, paddingHorizontal: 30 },
  fade: { position: "absolute", left: 0, right: 0, height: 36 },
  fadeTop: { top: 0 },
  fadeBottom: { bottom: 0, height: 48 },
});
