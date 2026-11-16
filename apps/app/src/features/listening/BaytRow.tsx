import type { PublishedBayt } from "@shawared/contracts";
import { fonts } from "@shawared/design";
import { wordKey } from "@shawared/listening";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import type { PressState } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { digits, t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useListening } from "./state";

type Props = {
  bayt: PublishedBayt;
  isCurrent: boolean;
  currentHalf: 1 | 2 | null;
  isPinned: boolean;
  onLayout: (n: number, e: LayoutChangeEvent) => void;
};

export const BaytRow = memo(function BaytRow({ bayt, isCurrent, currentHalf, isPinned, onLayout }: Props) {
  const { layout, trOn, ordered, pin, setSheetOpen, playFrom, closeGloss } = useListening();
  const { palette, lang } = useSettings();
  const wide = layout === "wide";
  const translation = trOn ? ordered.find((s) => s.abyat[bayt.n]?.translation)?.abyat[bayt.n]?.translation : undefined;
  const pair = Array.isArray(translation) ? translation : null;
  const sentence = typeof translation === "string" ? translation : null;

  // A whole bayt timed at once lights both halves.
  const halfOn = (h: 1 | 2) => isCurrent && (currentHalf === null || currentHalf === h);
  const halfColor = (h: 1 | 2) => (halfOn(h) ? palette.fg : isCurrent ? palette.partner : palette.rest);

  const open = () => {
    closeGloss();
    pin(bayt.n);
    if (!wide) setSheetOpen(true);
  };

  const half = (h: 1 | 2) => {
    const text = h === 1 ? bayt.sadr : bayt.ajuz;
    const align = wide || pair || sentence ? "center" : h === 1 ? "flex-start" : "flex-end";
    return (
      <View style={wide ? styles.col : null}>
        <Words
          n={bayt.n}
          half={h}
          text={text}
          color={halfColor(h)}
          on={halfOn(h)}
          align={align}
          size={wide ? 22 : 19.5}
          inset={!wide && !trOn ? h : 0}
        />
        {pair && (
          <Text style={[styles.tr, wide && styles.trWide, { color: halfOn(h) ? palette.fg : isCurrent ? palette.partner : palette.rest }]}>
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
      style={[styles.bayt, wide ? styles.baytWide : null, isPinned && { backgroundColor: palette.fold, borderColor: palette.line }]}
    >
      <NumberButton n={bayt.n} isCurrent={isCurrent} wide={wide} onPress={() => playFrom(bayt.n)} />
      {wide ? (
        <View style={styles.hrow}>
          {half(1)}
          <View style={[styles.cz, { backgroundColor: isCurrent ? palette.partner : palette.line2 }]} />
          {half(2)}
        </View>
      ) : (
        <>
          {half(1)}
          {half(2)}
        </>
      )}
      {sentence && (
        <Text style={[styles.tr, styles.trs, wide && styles.trWide, { color: isCurrent ? palette.fg : palette.rest }]}>{sentence}</Text>
      )}
    </Pressable>
  );
});

function NumberButton({ n, isCurrent, wide, onPress }: { n: number; isCurrent: boolean; wide: boolean; onPress: () => void }) {
  const { palette, lang } = useSettings();
  // All three marks stay mounted and fade, so the element under the pointer never changes mid-press.
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(lang, "playFrom", { n })}
      onPress={onPress}
      style={(s: PressState) => [styles.num, { top: wide ? 19 : 14 }, (s.hovered || s.focused) && { backgroundColor: palette.fold }]}
    >
      {(s: PressState) => {
        const hover = !!s.hovered;
        return (
          <>
            <Text
              style={[styles.numText, styles.layer, { color: palette.rest, fontFamily: fonts.ui, opacity: hover || isCurrent ? 0 : 1 }]}
            >
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

/** A half-verse as a row of words, so words with a meaning can be tapped on their own. */
function Words({
  n,
  half,
  text,
  color,
  on,
  align,
  size,
  inset,
}: {
  n: number;
  half: 1 | 2;
  text: string;
  color: string;
  on: boolean;
  align: "center" | "flex-start" | "flex-end";
  size: number;
  inset: 0 | 1 | 2;
}) {
  const { words, openGloss, unpin, setSheetOpen, layout } = useListening();
  const { palette } = useSettings();
  const base = { fontFamily: fonts.verse, fontSize: size, lineHeight: Math.round(size * 2.05), color };
  return (
    <View
      style={[
        styles.words,
        { justifyContent: align, columnGap: size * 0.28 },
        inset === 1 && { paddingEnd: "8%" },
        inset === 2 && { paddingStart: "8%" },
      ]}
    >
      {text.split(" ").map((w, i) => {
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
            onPress={() => {
              if (layout === "compact") {
                setSheetOpen(false);
                unpin();
              }
              openGloss({ key, n, half });
            }}
            style={(s: PressState) => [styles.g, (s.hovered || s.focused) && { backgroundColor: `${palette.accent}29` }]}
          >
            <Text style={base}>{w}</Text>
            <View style={[styles.gDot, { backgroundColor: palette.accent, opacity: on ? 1 : 0.55, bottom: size * 0.32 }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bayt: {
    position: "relative",
    paddingVertical: 8,
    paddingStart: 32,
    paddingEnd: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  baytWide: { paddingVertical: 10, paddingStart: 44, paddingEnd: 14 },
  hrow: { flexDirection: "row", alignItems: "flex-start", gap: 22 },
  col: { flex: 1, minWidth: 0 },
  cz: { width: 6, height: 6, marginTop: 21, transform: [{ rotate: "45deg" }] },
  words: { flexDirection: "row", flexWrap: "wrap" },
  g: { borderRadius: 5, position: "relative", alignItems: "center" },
  gDot: { position: "absolute", width: 4, height: 4, transform: [{ rotate: "45deg" }] },
  tr: {
    fontFamily: fonts.translation,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: -5,
    marginBottom: 7,
    writingDirection: "ltr",
  },
  trWide: { fontSize: 14.5, marginTop: -4 },
  trs: { marginTop: 2, paddingHorizontal: "6%" },
  num: { position: "absolute", start: 2, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 11 },
  layer: { position: "absolute" },
  layerCenter: { position: "absolute" },
  numDot: { width: 8, height: 8, transform: [{ rotate: "45deg" }] },
});
