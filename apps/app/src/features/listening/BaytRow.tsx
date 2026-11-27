import type { PublishedBayt } from "@shawared/contracts";
import { space } from "@shawared/design";
import { wordKey } from "@shawared/listening";
import { memo, useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type HostInstance, type StyleProp, type ViewStyle } from "react-native";
import type { PressState } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { Measure, shownWords } from "../../components/ui/Measure";
import { digits, t } from "../../lib/i18n";
import { isWide, responsive, scale, useLayout } from "../../lib/responsive";
import { useStore } from "../../lib/store";
import { useSettings } from "../../lib/settings";
import { useType, VERSE_LINE } from "../../lib/type";
import { useListening } from "./state";

const NUMBER_SIZE = 28;
const web = Platform.OS === "web";

type Props = {
  bayt: PublishedBayt;
  isCurrent: boolean;
  currentHalf: 1 | 2 | null;
  isPinned: boolean;
  onLayout: () => void;
  rowRef: (n: number, node: HostInstance | null) => void;
};

/**
 * One bayt of the poem page. Phones stack its halves, the sadr at the start and the ajuz at
 * the end; wide windows set them side by side in two even columns, with a rhombus between.
 */
export const BaytRow = memo(function BaytRow({ bayt, isCurrent, currentHalf, isPinned, onLayout, rowRef }: Props) {
  const { trOn, ordered, openBayt, playFrom, hover } = useListening();
  const { palette, lang } = useSettings();
  const type = useType();
  const layout = useLayout();
  const ref = useCallback((node: HostInstance | null) => rowRef(bayt.n, node), [bayt.n, rowRef]);
  const translation = trOn ? ordered.find((s) => s.abyat[bayt.n]?.translation)?.abyat[bayt.n]?.translation : undefined;
  const pair = Array.isArray(translation) ? translation : null;
  const sentence = typeof translation === "string" ? translation : null;

  // The half being recited is saffron; a whole bayt timed at once lights both halves.
  const halfOn = (h: 1 | 2) => isCurrent && (currentHalf === null || currentHalf === h);
  const halfColor = (h: 1 | 2) => (halfOn(h) ? palette.accent : palette.rest);

  const half = (h: 1 | 2) => {
    const text = h === 1 ? bayt.sadr : bayt.ajuz;
    const align = pair || sentence ? styles.center : h === 1 ? layout.style(sized.alignStart) : layout.style(sized.alignEnd);
    return (
      <View style={[layout.style(sized.half), pair && styles.withTr]}>
        <Words n={bayt.n} half={h} text={text} color={halfColor(h)} on={halfOn(h)} align={align} inset={trOn ? 0 : h} />
        {pair && <Text style={[type.verseTranslation, styles.tr, { color: halfOn(h) ? palette.fg : palette.muted }]}>{pair[h - 1]}</Text>}
      </View>
    );
  };

  return (
    <Pressable
      ref={ref}
      onLayout={onLayout}
      onPress={() => openBayt(bayt.n)}
      onHoverIn={() => hover.bayt.set({ n: bayt.n })}
      onHoverOut={() => hover.bayt.get().n === bayt.n && hover.bayt.set({ n: null })}
      accessibilityLabel={t(lang, "verse", { n: bayt.n })}
      accessibilityHint={t(lang, "expand")}
      style={[
        styles.bayt,
        layout.style(sized.bayt),
        (pair || sentence) && styles.baytTr,
        isCurrent && { backgroundColor: palette.raise, borderColor: palette.line },
        isPinned && !isCurrent && { backgroundColor: palette.fold, borderColor: palette.line },
      ]}
    >
      <NumberButton n={bayt.n} onPress={() => playFrom(bayt.n)} />
      <View style={layout.style(pair || sentence ? sized.halvesTr : sized.halves)}>
        {half(1)}
        <View style={[styles.cz, layout.style(sized.cz), { backgroundColor: palette.line2 }]} />
        {half(2)}
      </View>
      {sentence && (
        <Text style={[type.verseTranslation, styles.tr, styles.trs, { color: isCurrent ? palette.fg : palette.muted }]}>{sentence}</Text>
      )}
    </Pressable>
  );
});

function NumberButton({ n, onPress }: { n: number; onPress: () => void }) {
  const { hover } = useListening();
  const { palette, lang } = useSettings();
  const type = useType();
  const layout = useLayout();
  const rowHovered = useStore(
    hover.bayt,
    useCallback((s: { n: number | null }) => s.n === n, [n]),
  );
  // The number, and ▶ on ink while the mouse is on its bayt; the playing bayt is marked by its
  // row, not its number.
  // Every layer stays mounted and fades, so the element under the pointer never changes mid-press.
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(lang, "playFrom", { n })}
      onPress={onPress}
      style={[styles.num, layout.style(sized.num)]}
    >
      {(s: PressState) => {
        const hover = rowHovered || !!s.hovered;
        return (
          <>
            <View
              pointerEvents="none"
              style={[styles.numInk, styles.layerCenter, { backgroundColor: palette.fg, opacity: hover ? 1 : 0 }]}
            />
            <Text style={[type.caption, styles.layer, { color: palette.muted, opacity: hover ? 0 : 1 }]}>{digits(n, lang)}</Text>
            <View pointerEvents="none" style={[styles.layerCenter, { opacity: hover ? 1 : 0 }]}>
              <Icon name="play" size={12} color={palette.bg} />
            </View>
          </>
        );
      }}
    </Pressable>
  );
}

/**
 * Where the dotted line under a word with a meaning sits, from the top of the word's box (its
 * highest mark, 1.3 em above the baseline): 0.62 em under the baseline, below the kasras and
 * most tails, and still inside the box so it never reaches the next line.
 */
const MARK_BELOW = 1.3 + 0.62;

/** A half-verse as a row of words, so words with a meaning can be tapped on their own. */
function Words({
  n,
  half,
  text,
  color,
  on,
  align,
  inset,
}: {
  n: number;
  half: 1 | 2;
  text: string;
  color: string;
  on: boolean;
  align: StyleProp<ViewStyle>;
  /** Phones step the halves when there's no translation: the sadr keeps off the end, the ajuz off the start. */
  inset: 0 | 1 | 2;
}) {
  const { words, openWord, focus, bundle, hover } = useListening();
  const { palette } = useSettings();
  const type = useType();
  const layout = useLayout();
  // The verses' font size; on the web a CSS value, used only through `scale`.
  const size = layout.value(VERSE_LINE.phone, VERSE_LINE.wide);
  const base = [type.verseLine, { color }];
  // Every half at the poem's measure, with its kashida (scripts/kashida.ts). The words keep
  // their places: kashida never adds a space.
  const { measure, kashida } = bundle.poem;
  const plain = text.split(" ");
  const shown = shownWords(text, kashida[`${n}.${half}`]);
  const focused = focus ? words.get(focus)?.address : undefined;
  const list = shown.map((w, i) => {
    const key = wordKey(n, half, i + 1);
    if (!words.has(key))
      return (
        <Text key={key} style={base}>
          {w}
        </Text>
      );
    return (
      <Pressable
        key={key}
        accessibilityRole="button"
        accessibilityLabel={plain[i]}
        onPress={() => openWord(key, n)}
        onHoverIn={
          web
            ? (e) => {
                const event = e.nativeEvent as unknown as PointerEvent;
                if ((event.pointerType && event.pointerType !== "mouse") || !isWide()) return;
                const el = (event.target as Element | null)?.closest?.('[role="button"]');
                if (!el) return;
                hover.enterWord(key, () => {
                  const r = el.getBoundingClientRect();
                  return { x: r.left, y: r.top, w: r.width, h: r.height };
                });
              }
            : undefined
        }
        onHoverOut={web ? hover.leaveWord : undefined}
        style={(s: PressState) => [
          styles.g,
          (s.hovered || words.get(key)?.address === focused) && { backgroundColor: `${palette.accent}1F` },
        ]}
      >
        <Text style={base}>{w}</Text>
        <View style={[styles.gLine, { borderColor: palette.accent, opacity: on ? 1 : 0.6, top: scale(size, MARK_BELOW, -1) }]} />
      </Pressable>
    );
  });
  return (
    <View
      style={[
        styles.words,
        align,
        { columnGap: scale(size, 0.28) },
        inset === 1 && layout.style(sized.insetEnd),
        inset === 2 && layout.style(sized.insetStart),
      ]}
    >
      <Measure measure={measure} size={size}>
        {list}
      </Measure>
    </View>
  );
}

const sized = {
  bayt: responsive(
    // Including the border, 8px inside the list's 8px inset gives the shared 16px text gutter.
    { paddingTop: space.m, paddingBottom: space.m, paddingStart: NUMBER_SIZE + space.m - 1, paddingEnd: space.m - 1 },
    { paddingTop: 10, paddingBottom: 10, paddingStart: 44, paddingEnd: 14 },
  ),
  halves: responsive(
    { flexDirection: "column" as const, alignItems: "stretch" as const, gap: 0 },
    { flexDirection: "row" as const, alignItems: "flex-start" as const, gap: 22 },
  ),
  halvesTr: responsive(
    { flexDirection: "column" as const, alignItems: "stretch" as const, gap: space.m },
    { flexDirection: "row" as const, alignItems: "flex-start" as const, gap: 22 },
  ),
  half: responsive(
    { flexGrow: 0, flexShrink: 0, flexBasis: "auto", minWidth: 0 },
    { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0 },
  ),
  /** The rhombus between the halves, on wide windows. */
  cz: responsive({ display: "none" as const }, { display: "flex" as const }),
  alignStart: responsive({ justifyContent: "flex-start" as const }, { justifyContent: "center" as const }),
  alignEnd: responsive({ justifyContent: "flex-end" as const }, { justifyContent: "center" as const }),
  insetEnd: responsive({ paddingEnd: "8%" }, { paddingEnd: 0 }),
  insetStart: responsive({ paddingStart: "8%" }, { paddingStart: 0 }),
  num: responsive({ top: 14, start: space.xs }, { top: 19, start: space.xxs }),
};

const styles = StyleSheet.create({
  bayt: { position: "relative", borderRadius: 14, borderWidth: 1, borderColor: "transparent" },
  baytTr: { gap: space.m },
  withTr: { gap: space.xs },
  center: { justifyContent: "center" },
  cz: { width: 6, height: 6, marginTop: 21, transform: [{ rotate: "45deg" }] },
  words: { flexDirection: "row", flexWrap: "wrap" },
  g: { borderRadius: 5, position: "relative", alignItems: "center" },
  // A box of no height with a dotted border on every side: a dotted line, on every platform.
  gLine: { position: "absolute", left: 1, right: 1, height: 0, borderWidth: 1, borderStyle: "dotted" },
  tr: { textAlign: "center", writingDirection: "ltr" },
  trs: { paddingHorizontal: "6%" },
  num: { position: "absolute", width: NUMBER_SIZE, height: NUMBER_SIZE, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  layer: { position: "absolute" },
  layerCenter: { position: "absolute" },
  numInk: { width: NUMBER_SIZE, height: NUMBER_SIZE, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
