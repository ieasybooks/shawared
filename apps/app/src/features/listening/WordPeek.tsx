import { space } from "@shawared/design";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Tag } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { isWide } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { createStore, useStore } from "../../lib/store";
import { useType } from "../../lib/type";
import { useListening } from "./state";

// On wide windows, resting the mouse on a word with a meaning shows the meaning in a small card
// under it; a click still opens the whole bayt's explanation. Like a tooltip, it waits a moment
// before the first card, so passing over a verse shows nothing, and once one is open the words
// beside it open at once.

const web = Platform.OS === "web";
const OPEN_MS = 450;
const CLOSE_MS = 150;
const WARM_MS = 400;
const W = 288;

type Rect = { x: number; y: number; w: number; h: number };
const store = createStore<{ key: string | null; rect: Rect | null }>({ key: null, rect: null });
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let warmUntil = 0;

export function hidePeek() {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
  if (store.get().key) store.set({ key: null, rect: null });
}

type HoverEvent = { nativeEvent: unknown };

/** The hover handlers of a word with a meaning (none on the apps). */
export function peekHandlers(key: string): { onHoverIn?: (e: HoverEvent) => void; onHoverOut?: () => void } {
  if (!web) return {};
  return {
    onHoverIn: (e) => {
      const ev = e.nativeEvent as PointerEvent;
      if ((ev.pointerType && ev.pointerType !== "mouse") || !isWide()) return;
      const el = (ev.target as Element | null)?.closest?.('[role="button"]');
      if (!el) return;
      clearTimeout(closeTimer);
      if (store.get().key === key) return;
      const show = () => {
        const r = el.getBoundingClientRect();
        store.set({ key, rect: { x: r.left, y: r.top, w: r.width, h: r.height } });
      };
      clearTimeout(openTimer);
      if (store.get().key || performance.now() < warmUntil) show();
      else openTimer = setTimeout(show, OPEN_MS);
    },
    onHoverOut: () => {
      clearTimeout(openTimer);
      if (!store.get().key) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        warmUntil = performance.now() + WARM_MS;
        store.set({ key: null, rect: null });
      }, CLOSE_MS);
    },
  };
}

const selectAll = (s: { key: string | null; rect: Rect | null }) => s;

/** The card itself, drawn once for the page, over everything. */
export function WordPeek() {
  const { words } = useListening();
  const { palette, lang, start } = useSettings();
  const type = useType();
  const { key, rect } = useStore(store, selectAll);
  // Scrolling moves the word away from its card: put the card away.
  useEffect(() => {
    if (!web) return;
    const hide = () => hidePeek();
    addEventListener("scroll", hide, true);
    return () => {
      removeEventListener("scroll", hide, true);
      hidePeek();
    };
  }, []);
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
