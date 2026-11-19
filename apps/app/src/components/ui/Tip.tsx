import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";

/** What a control's tip says: its name, whether it is on, and what it does. */
export type TipText = {
  title: string;
  body: string;
  /** For toggles: on or off, after the title. */
  state?: string;
  /** Which edge of the control the tip lines up with, so it stays inside the window. */
  align: "start" | "end";
};

/** How long the pointer rests on a control before its tip shows, as with the browser's own. */
const WAIT = 350;

/**
 * Shows a tip while a mouse rests on a control. Touch never shows it, and pressing the control
 * hides it. Spread `handlers` on the control's Pressable.
 */
export function useTip(enabled: boolean) {
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);
  if (!enabled) return { shown: false, handlers: {} };
  return {
    shown,
    handlers: {
      onHoverIn: (e: { nativeEvent: unknown }) => {
        const type = (e.nativeEvent as { pointerType?: string }).pointerType;
        if (type && type !== "mouse") return;
        clear();
        timer.current = setTimeout(() => setShown(true), WAIT);
      },
      onHoverOut: () => {
        clear();
        setShown(false);
      },
      onPressIn: () => {
        clear();
        setShown(false);
      },
    },
  };
}

/** The tip: an ink card above the control. */
export function Tip({ tip }: { tip: TipText }) {
  const { palette, start } = useSettings();
  const type = useType();
  return (
    <View
      pointerEvents="none"
      role="tooltip"
      style={[styles.tip, tip.align === "start" ? styles.atStart : styles.atEnd, { backgroundColor: palette.fg }]}
    >
      <View style={styles.head}>
        <Text style={[type.labelStrong, styles.shrink, { color: palette.bg, textAlign: start }]}>{tip.title}</Text>
        {tip.state ? <Text style={[type.label, styles.soft, { color: palette.bg }]}>{tip.state}</Text> : null}
      </View>
      <Text style={[type.label, styles.body, { color: palette.bg, textAlign: start }]}>{tip.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tip: {
    position: "absolute",
    bottom: "100%",
    marginBottom: 10,
    width: 248,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  atStart: { start: 0 },
  atEnd: { end: 0 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  shrink: { flexShrink: 1 },
  soft: { opacity: 0.7 },
  body: { opacity: 0.85 },
});
