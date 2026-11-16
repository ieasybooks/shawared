import { fonts } from "@shawared/design";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import { useSettings } from "../../lib/settings";
import { Icon, type IconName } from "./Icon";

// React Native Web adds `hovered` and `focused` to the pressable state.
export type PressState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };

export function IconButton({
  icon,
  label,
  onPress,
  size = 42,
  iconSize = 22,
  color,
  flip,
  pressed: on,
  style,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  flip?: boolean;
  pressed?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { palette } = useSettings();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      {...(on === undefined ? {} : { accessibilityState: { selected: on } })}
      onPress={onPress}
      style={(s: PressState) => [
        styles.icon,
        { width: size, height: size, borderRadius: size / 2 },
        (s.hovered || s.pressed) && { backgroundColor: palette.fold },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={color ?? palette.muted} {...(flip ? { flip } : {})} />
      {on && <View style={[styles.onDot, { backgroundColor: palette.accent }]} />}
    </Pressable>
  );
}

/** The saffron rhombus: the brand's nuqta. */
export function Nuqta({ size = 6, color, style }: { size?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  const { palette } = useSettings();
  return (
    <View style={[{ width: size, height: size, backgroundColor: color ?? palette.accent, transform: [{ rotate: "45deg" }] }, style]} />
  );
}

export function Chip({
  children,
  onPress,
  active,
  ghost,
  lang,
}: {
  children: ReactNode;
  onPress?: () => void;
  active?: boolean;
  ghost?: boolean;
  lang?: "ar" | "en";
}) {
  const { palette } = useSettings();
  const body = (
    <Text style={[styles.chipText, { color: active ? palette.fg : palette.muted, fontFamily: lang === "ar" ? fonts.ui : fonts.ui }]}>
      {children}
    </Text>
  );
  const frame = [
    styles.chip,
    { borderColor: ghost ? "transparent" : active ? palette.accent : palette.line },
    ghost && { paddingHorizontal: 4 },
    active && { borderWidth: 1.5 },
  ];
  if (!onPress) return <View style={frame}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      {...(active === undefined ? {} : { accessibilityState: { selected: active } })}
      onPress={onPress}
      style={frame}
    >
      {body}
    </Pressable>
  );
}

/** The translation switch: a pill with a rhombus that fills when on. */
export function TogglePill({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { palette } = useSettings();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={[styles.pill, { borderColor: on ? palette.accent : palette.line }]}
    >
      <View
        style={[styles.pillDot, { borderColor: on ? palette.accent : palette.muted, backgroundColor: on ? palette.accent : "transparent" }]}
      />
      <Text style={[styles.chipText, { color: on ? palette.fg : palette.muted, fontFamily: fonts.ui }]}>{label}</Text>
    </Pressable>
  );
}

/** Two-option switch for language and appearance. */
export function Segmented<V extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
  label: string;
}) {
  const { palette } = useSettings();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.seg, { borderColor: palette.line }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segItem, on && { backgroundColor: palette.fg }]}
          >
            <Text style={[styles.segText, { color: on ? palette.bg : palette.muted, fontFamily: fonts.ui }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: "center", justifyContent: "center" },
  onDot: { position: "absolute", bottom: 4, width: 4, height: 4, transform: [{ rotate: "45deg" }] },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 2 },
  chipText: { fontSize: 12, lineHeight: 20 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingStart: 10,
    paddingEnd: 12,
    paddingVertical: 3,
  },
  pillDot: { width: 7, height: 7, borderWidth: 1.5, transform: [{ rotate: "45deg" }] },
  seg: { flexDirection: "row", borderWidth: 1, borderRadius: 999, padding: 2 },
  segItem: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 },
  segText: { fontSize: 12, lineHeight: 20 },
});
