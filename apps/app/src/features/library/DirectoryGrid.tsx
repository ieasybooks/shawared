import { space } from "@shawared/design";
import { Link } from "expo-router";
import { Children, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { responsive, useLayout } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { typeFor, useType } from "../../lib/type";

export function DirectoryGrid({ children, phoneCount }: { children: ReactNode; phoneCount?: number }) {
  const { palette } = useSettings();
  const layout = useLayout();
  const count = Children.count(children);
  const narrowCount = phoneCount ?? count;
  const phoneBlanks = narrowCount % 2;
  const wideBlanks = (3 - (count % 3)) % 3;
  return (
    <View style={[styles.grid, { backgroundColor: palette.raise, borderColor: palette.line }]}>
      {children}
      {Array.from({ length: Math.max(phoneBlanks, wideBlanks) }, (_, i) => (
        <View
          key={i}
          aria-hidden
          pointerEvents="none"
          style={[
            layout.style(cellSize),
            {
              display: layout.value(i < phoneBlanks ? "flex" : "none", i < wideBlanks ? "flex" : "none"),
              borderColor: palette.line,
              borderStartWidth: 1,
              borderTopWidth: layout.value(narrowCount >= 2 ? 1 : 0, count >= 3 ? 1 : 0),
            },
          ]}
        />
      ))}
    </View>
  );
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
  grid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  cell: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingVertical: space.m },
  cellText: { gap: space.xs },
});
