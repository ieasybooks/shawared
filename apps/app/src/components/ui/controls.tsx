import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
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
  pressed: on,
  style,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
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
      <Icon name={icon} size={iconSize} color={color ?? palette.muted} />
      {on && <View style={[styles.onDot, { backgroundColor: palette.accent }]} />}
    </Pressable>
  );
}

/** An icon that opens a page: a link, round like `IconButton`, marked when its page is open. */
export function IconLink({
  icon,
  label,
  href,
  current,
  size = 42,
  iconSize = 22,
  color,
}: {
  icon: IconName;
  label: string;
  href: string;
  current?: boolean;
  size?: number;
  iconSize?: number;
  color?: string;
}) {
  const { palette } = useSettings();
  // Link asChild needs one flat style object, so the hover shade comes from state.
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        aria-current={current ? "page" : undefined}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={StyleSheet.flatten([
          styles.icon,
          { width: size, height: size, borderRadius: size / 2 },
          hovered && { backgroundColor: palette.fold },
        ])}
      >
        <Icon name={icon} size={iconSize} color={color ?? palette.muted} />
        {current && <View style={[styles.onDot, { backgroundColor: palette.accent }]} />}
      </Pressable>
    </Link>
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
  icon,
}: {
  children: ReactNode;
  onPress?: () => void;
  active?: boolean;
  ghost?: boolean;
  /** An icon after the label, such as "link" for a chip that leaves the app. */
  icon?: IconName;
}) {
  const { palette } = useSettings();
  const type = useType();
  const color = active ? palette.fg : palette.muted;
  const text = <Text style={[type.label, { color }]}>{children}</Text>;
  const body = icon ? (
    <View style={styles.chipRow}>
      {text}
      <Icon name={icon} size={12} color={color} />
    </View>
  ) : (
    text
  );
  const frame = [
    styles.chip,
    { borderColor: ghost ? "transparent" : active ? palette.accent : palette.line },
    ghost && { paddingHorizontal: space.xs },
    active && { borderWidth: 1.5 },
  ];
  if (!onPress) return <View style={frame}>{body}</View>;
  return (
    <Pressable accessibilityRole="button" aria-selected={active} onPress={onPress} style={frame}>
      {body}
    </Pressable>
  );
}

/** A small bordered label, such as the root of a word. Always laid out for Arabic. */
export function Tag({ children }: { children: ReactNode }) {
  const { palette } = useSettings();
  const type = useType();
  return (
    <View style={[styles.tag, { borderColor: palette.line }]}>
      <Text style={[type.captionAr, { color: palette.muted }]}>{children}</Text>
    </View>
  );
}

/** The translation switch: a pill with a rhombus that fills when on. */
export function TogglePill({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { palette } = useSettings();
  const type = useType();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={[styles.chip, styles.pill, { borderColor: on ? palette.accent : palette.line }]}
    >
      <View
        style={[styles.pillDot, { borderColor: on ? palette.accent : palette.muted, backgroundColor: on ? palette.accent : "transparent" }]}
      />
      <Text style={[type.label, { color: on ? palette.fg : palette.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: "center", justifyContent: "center" },
  onDot: { position: "absolute", bottom: 4, width: 4, height: 4, transform: [{ rotate: "45deg" }] },
  // Pills keep one height in both languages; the text box inside is its ink, centred.
  chip: { minHeight: 28, justifyContent: "center", borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: space.xxs },
  chipRow: { flexDirection: "row", alignItems: "center", gap: space.s },
  pill: { flexDirection: "row", alignItems: "center", gap: 7, paddingStart: 10, paddingEnd: 12 },
  pillDot: { width: 7, height: 7, borderWidth: 1.5, transform: [{ rotate: "45deg" }] },
  tag: { minHeight: 22, justifyContent: "center", borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 1 },
});
