import { space } from "@shawared/design";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Tag } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useStore } from "../../lib/store";
import { useType } from "../../lib/type";
import type { WordPeekState } from "./hover";
import { useListening } from "./state";

// On wide windows, resting the mouse on a word with a meaning shows the meaning in a small card
// under it; a click still opens the whole bayt's explanation. Like a tooltip, it waits a moment
// before the first card, so passing over a verse shows nothing, and once one is open the words
// beside it open at once.

const web = Platform.OS === "web";
const W = 288;

const selectAll = (s: WordPeekState) => s;

/** The card itself, drawn once for the page, over everything. */
export function WordPeek() {
  const { words, hover } = useListening();
  const { palette, lang, start } = useSettings();
  const type = useType();
  const { key, rect } = useStore(hover.word, selectAll);
  // Scrolling moves the word away from its card: put the card away.
  useEffect(() => {
    if (!web) return;
    const hide = hover.hideWord;
    addEventListener("scroll", hide, true);
    return () => {
      removeEventListener("scroll", hide, true);
      hide();
    };
  }, [hover]);
  const hit = key ? words.get(key) : undefined;
  if (!hit || !rect) return null;
  const left = Math.max(8, Math.min(innerWidth - W - 8, rect.x + rect.w / 2 - W / 2));
  const below = rect.y + rect.h + 190 < innerHeight - 90;
  const place = (below ? { top: rect.y + rect.h + 8 } : { bottom: innerHeight - rect.y + 8 }) as ViewStyle;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.card,
        {
          position: "fixed" as ViewStyle["position"],
          left,
          width: W,
          backgroundColor: palette.raise,
          borderColor: palette.line,
          shadowColor: palette.shadow,
        },
        place,
      ]}
    >
      <View style={styles.head}>
        <Text style={[type.noteHead, styles.rtl, { color: palette.fg }]}>{hit.note.head ?? hit.note.word}</Text>
        {hit.note.root && <Tag>{t(lang, "root", { r: hit.note.root })}</Tag>}
      </View>
      <Text style={[type.proseSmall, { color: palette.fg, textAlign: start }]}>{hit.note.meaning}</Text>
      <View style={styles.hint}>
        <Icon name="notes" size={14} color={palette.accent} />
        <Text style={[type.caption, { color: palette.accent }]}>{t(lang, "wordHint")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    zIndex: 50,
    borderWidth: 1,
    borderRadius: 14,
    padding: space.xl,
    gap: space.l,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
  },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.l },
  rtl: { writingDirection: "rtl" },
  hint: { flexDirection: "row", alignItems: "center", gap: space.s },
});
