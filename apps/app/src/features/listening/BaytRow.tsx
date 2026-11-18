import type { PublishedBayt } from "@shawared/contracts";
import { space } from "@shawared/design";
import { wordKey } from "@shawared/listening";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import type { PressState } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { Measure, shownWords } from "../../components/ui/Measure";
import { digits, t } from "../../lib/i18n";
import { isWide, responsive, scale, useLayout } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { useType, VERSE_LINE } from "../../lib/type";
import { useListening } from "./state";

type Props = {
  bayt: PublishedBayt;
  isCurrent: boolean;
  currentHalf: 1 | 2 | null;
  isPinned: boolean;
  onLayout: (n: number, e: LayoutChangeEvent) => void;
};

/**
 * One bayt of the poem page. Phones stack its halves, the sadr at the start and the ajuz at
 * the end; wide windows set them side by side in two even columns, with a rhombus between.
 */
export const BaytRow = memo(function BaytRow({ bayt, isCurrent, currentHalf, isPinned, onLayout }: Props) {
  const { trOn, ordered, pin, setSheetOpen, playFrom } = useListening();
  const { palette, lang } = useSettings();
  const type = useType();
  const layout = useLayout();
  const translation = trOn ? ordered.find((s) => s.abyat[bayt.n]?.translation)?.abyat[bayt.n]?.translation : undefined;
  const pair = Array.isArray(translation) ? translation : null;
  const sentence = typeof translation === "string" ? translation : null;

  // A whole bayt timed at once lights both halves.
  const halfOn = (h: 1 | 2) => isCurrent && (currentHalf === null || currentHalf === h);
  const halfColor = (h: 1 | 2) => (halfOn(h) ? palette.fg : isCurrent ? palette.partner : palette.rest);

  const open = () => {
    pin(bayt.n);
    // Phones open the explanation's sheet; wide windows show it beside the verses.
    if (!isWide()) setSheetOpen(true);
  };

  const half = (h: 1 | 2) => {
    const text = h === 1 ? bayt.sadr : bayt.ajuz;
    // Under a translation, or side by side on wide windows, each half is centred.
    const align = pair || sentence ? styles.center : h === 1 ? layout.style(sized.alignStart) : layout.style(sized.alignEnd);
    return (
      <View style={[layout.style(sized.half), pair && styles.withTr]}>
        <Words n={bayt.n} half={h} text={text} color={halfColor(h)} on={halfOn(h)} align={align} inset={trOn ? 0 : h} />
        {pair && (
          <Text style={[type.verseTranslation, styles.tr, { color: halfOn(h) ? palette.fg : isCurrent ? palette.partner : palette.rest }]}>
            {pair[h - 1]}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Pressable
      onLayout={(e) => onLayout(bayt.n, e)}
      onPress={open}
      accessibilityLabel={t(lang, "verse", { n: bayt.n })}
      accessibilityHint={t(lang, "expand")}
      style={[
        styles.bayt,
        layout.style(sized.bayt),
        (pair || sentence) && styles.baytTr,
        isPinned && { backgroundColor: palette.fold, borderColor: palette.line },
      ]}
    >
      <NumberButton n={bayt.n} isCurrent={isCurrent} onPress={() => playFrom(bayt.n)} />
      <View style={layout.style(pair || sentence ? sized.halvesTr : sized.halves)}>
        {half(1)}
        <View style={[styles.cz, layout.style(sized.cz), { backgroundColor: isCurrent ? palette.partner : palette.line2 }]} />
        {half(2)}
      </View>
      {sentence && (
        <Text style={[type.verseTranslation, styles.tr, styles.trs, { color: isCurrent ? palette.fg : palette.rest }]}>{sentence}</Text>
      )}
    </Pressable>
  );
});

function NumberButton({ n, isCurrent, onPress }: { n: number; isCurrent: boolean; onPress: () => void }) {
  const { palette, lang } = useSettings();
  const type = useType();
  const layout = useLayout();
  // All three marks stay mounted and fade, so the element under the pointer never changes mid-press.
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(lang, "playFrom", { n })}
      onPress={onPress}
      style={(s: PressState) => [styles.num, layout.style(sized.num), s.hovered && { backgroundColor: palette.fold }]}
    >
      {(s: PressState) => {
        const hover = !!s.hovered;
        return (
          <>
            <Text style={[type.caption, styles.layer, { color: palette.rest, opacity: hover || isCurrent ? 0 : 1 }]}>
              {digits(n, lang)}
            </Text>
            <View
              pointerEvents="none"
              style={[styles.numDot, styles.layerCenter, { backgroundColor: palette.accent, opacity: isCurrent && !hover ? 1 : 0 }]}
            />
            <View pointerEvents="none" style={[styles.layerCenter, { opacity: hover ? 1 : 0 }]}>
              <Icon name="play" size={13} color={palette.fg} />
            </View>
          </>
        );
      }}
    </Pressable>
  );
}

/**
 * Where the rhombus under a word with a meaning sits, from the top of the word's box (its
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
  const { words, openWord, focus, bundle } = useListening();
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
  // The word whose meaning is open, with the rest of its phrase.
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
        // A word opens its own bayt's explanation, with its meaning brought forward.
        onPress={() => openWord(key, n)}
        style={(s: PressState) => [
          styles.g,
          (s.hovered || words.get(key)?.address === focused) && { backgroundColor: `${palette.accent}29` },
        ]}
      >
        <Text style={base}>{w}</Text>
        <View style={[styles.gDot, { backgroundColor: palette.accent, opacity: on ? 1 : 0.55, top: scale(size, MARK_BELOW, -2) }]} />
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
    { paddingVertical: space.m, paddingStart: 32, paddingEnd: 6 },
    { paddingVertical: 10, paddingStart: 44, paddingEnd: 14 },
  ),
  // The halves: stacked on phones (spaced like the rest of the bayt), side by side on wide windows.
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
  num: responsive({ top: 14 }, { top: 19 }),
};

const styles = StyleSheet.create({
  bayt: { position: "relative", borderRadius: 14, borderWidth: 1, borderColor: "transparent" },
  /** With translations, the halves and their lines are spaced by gaps rather than by line height. */
  baytTr: { gap: space.m },
  withTr: { gap: space.xs },
  center: { justifyContent: "center" },
  cz: { width: 6, height: 6, marginTop: 21, transform: [{ rotate: "45deg" }] },
  words: { flexDirection: "row", flexWrap: "wrap" },
  g: { borderRadius: 5, position: "relative", alignItems: "center" },
  gDot: { position: "absolute", width: 4, height: 4, transform: [{ rotate: "45deg" }] },
  tr: { textAlign: "center", writingDirection: "ltr" },
  trs: { paddingHorizontal: "6%" },
  num: { position: "absolute", start: 2, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  layer: { position: "absolute" },
  layerCenter: { position: "absolute" },
  numDot: { width: 8, height: 8, transform: [{ rotate: "45deg" }] },
});
