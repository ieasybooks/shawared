import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { responsive, useLayout } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { typeFor, useType } from "../../lib/type";

export type DirectoryOrder = "alphabetical" | "byPoemCount" | "byRecordingCount" | "byRhymeLetter";

export function SortBar<T extends DirectoryOrder>({
  count,
  label,
  options,
  value,
  onChange,
}: {
  count: string;
  label: string;
  options: readonly T[];
  value: T;
  onChange: (order: T) => void;
}) {
  const { lang, palette, start } = useSettings();
  const type = useType();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.menu}>
      <View style={styles.bar}>
        <Text accessibilityLiveRegion="polite" style={[type.controlStrong, styles.grow, { color: palette.fg, textAlign: start }]}>
          {count}
        </Text>
        <Pressable
          accessibilityRole="button"
          aria-expanded={open}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(!open)}
          style={styles.sort}
        >
          <Text style={[type.label, { color: palette.muted }]}>{t(lang, value)}</Text>
          <Icon name={open ? "up" : "down"} size={14} color={palette.muted} />
        </Pressable>
      </View>
      {open && (
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={label}
          style={[styles.choices, { backgroundColor: palette.raise, borderColor: palette.line }]}
        >
          {options.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="radio"
              aria-checked={value === option}
              accessibilityState={{ checked: value === option }}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={styles.option}
            >
              <Text style={[type.control, styles.grow, { color: palette.fg, textAlign: start }]}>{t(lang, option)}</Text>
              {value === option && <Icon name="check" size={16} color={palette.accent} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function DirectoryGrid({ children }: { children: ReactNode }) {
  const { palette } = useSettings();
  return <View style={[styles.grid, { backgroundColor: palette.raise, borderColor: palette.line }]}>{children}</View>;
}

type CellAction = { href: string; selected?: never; onPress?: never } | { href?: never; selected: boolean; onPress: () => void };

export function DirectoryCell({
  name,
  count,
  index,
  hideOnPhone,
  href,
  selected,
  onPress,
}: CellAction & {
  name: string;
  count: string;
  index: number;
  hideOnPhone?: boolean;
}) {
  const { lang, palette, start } = useSettings();
  const type = useType();
  const layout = useLayout();
  const [hovered, setHovered] = useState(false);
  const cell = (
    <Pressable
      accessibilityRole={href ? "link" : "button"}
      {...(selected === undefined ? {} : { accessibilityState: { selected }, "aria-pressed": selected })}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={StyleSheet.flatten([
        styles.cell,
        layout.style(cellSize),
        hideOnPhone && layout.style(wideOnly),
        {
          borderColor: palette.line,
          backgroundColor: selected || hovered ? palette.fold : palette.raise,
          borderStartWidth: layout.value(index % 2 ? 1 : 0, index % 3 ? 1 : 0),
          borderTopWidth: layout.value(index >= 2 ? 1 : 0, index >= 3 ? 1 : 0),
        },
      ])}
    >
      <View style={[styles.grow, styles.cellText]}>
        <Text style={[lang === "ar" ? type.nameAr : layout.style(englishCellTitle), { color: palette.fg, textAlign: start }]}>{name}</Text>
        <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{count}</Text>
      </View>
      {href ? <Icon name="chevron" size={15} color={palette.muted} /> : selected && <Icon name="check" size={17} color={palette.accent} />}
    </Pressable>
  );
  return href ? (
    <Link href={href} asChild>
      {cell}
    </Link>
  ) : (
    cell
  );
}

const englishCellTitle = responsive(typeFor("en").controlStrong, typeFor("en").heading);
const cellSize = responsive(
  { width: "50%" as const, minHeight: 78, paddingHorizontal: space.l },
  { width: "33.3333%" as const, minHeight: 88, paddingHorizontal: space.xl },
);
const wideOnly = responsive({ display: "none" as const }, { display: "flex" as const });
const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  bar: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 40 },
  menu: { gap: space.s },
  sort: { flexDirection: "row", alignItems: "center", gap: space.s, minHeight: 44 },
  choices: { alignSelf: "flex-end", borderWidth: 1, borderRadius: 12, paddingHorizontal: space.l },
  option: { flexDirection: "row", alignItems: "center", minHeight: 44, gap: space.xl },
  grid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  cell: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingVertical: space.m },
  cellText: { gap: space.xs },
});
