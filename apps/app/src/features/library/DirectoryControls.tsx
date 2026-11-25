import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type HostInstance,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";
import { Dir } from "../../components/ui/Dir";
import { Icon } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { responsive, useLayout } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { typeFor, useType } from "../../lib/type";

export type DirectoryOrder = "alphabetical" | "byPoemCount" | "byRecordingCount" | "byRhymeLetter";

type SortOptions<T extends DirectoryOrder> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (order: T) => void;
};

export function SortBar<T extends DirectoryOrder>({ count, ...sort }: SortOptions<T> & { count: string }) {
  const { lang, palette, start } = useSettings();
  const type = useType();
  const trigger = useRef<HostInstance>(null);
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.bar}>
      <Text accessibilityLiveRegion="polite" style={[type.controlStrong, styles.grow, { color: palette.fg, textAlign: start }]}>
        {count}
      </Text>
      <Pressable
        ref={trigger}
        collapsable={false}
        accessibilityRole="button"
        aria-expanded={open}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={styles.sort}
      >
        <Text style={[type.label, { color: palette.muted }]}>{t(lang, sort.value)}</Text>
        <Icon name={open ? "up" : "down"} size={14} color={palette.muted} />
      </Pressable>
      {open && <SortMenu {...sort} trigger={trigger} close={() => setOpen(false)} />}
    </View>
  );
}

const OPTION_HEIGHT = 44;

function SortMenu<T extends DirectoryOrder>({
  label,
  options,
  value,
  onChange,
  trigger,
  close,
}: SortOptions<T> & { trigger: RefObject<HostInstance | null>; close: () => void }) {
  const { lang, palette, rtl, start } = useSettings();
  const type = useType();
  const [position, setPosition] = useState<ViewStyle | null>(null);

  // The modal covers the viewport. Measure again when it resizes, including on rotation.
  const place = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    trigger.current?.measureInWindow((x, y, w, h) => {
      const width = Math.min(200, layout.width - 2 * space.m);
      const end = Math.max(space.m, Math.min(rtl ? x : layout.width - x - w, layout.width - width - space.m));
      const above = y - space.s - space.m;
      const below = layout.height - y - h - space.s - space.m;
      const upwards = below < options.length * OPTION_HEIGHT + 2 && above > below;
      setPosition({
        width,
        end,
        maxHeight: Math.max(0, upwards ? above : below),
        ...(upwards ? { bottom: layout.height - y + space.s } : { top: y + h + space.s }),
      });
    });
  };

  return (
    <Modal transparent statusBarTranslucent onRequestClose={close}>
      <Dir dir={rtl ? "rtl" : "ltr"} style={styles.overlay} onLayout={place} onAccessibilityEscape={close}>
        <Pressable accessibilityLabel={t(lang, "close")} onPress={close} style={StyleSheet.absoluteFill} />
        {position && (
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={label}
            style={[styles.choices, position, { backgroundColor: palette.raise, borderColor: palette.line, shadowColor: palette.shadow }]}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  aria-checked={value === option}
                  accessibilityState={{ checked: value === option }}
                  onPress={() => {
                    onChange(option);
                    close();
                  }}
                  style={styles.option}
                >
                  <Text style={[type.control, styles.grow, { color: palette.fg, textAlign: start }]}>{t(lang, option)}</Text>
                  {value === option && <Icon name="check" size={16} color={palette.accent} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </Dir>
    </Modal>
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
  sort: { flexDirection: "row", alignItems: "center", gap: space.s, minHeight: 44 },
  overlay: { flex: 1 },
  choices: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: space.l,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  option: { flexDirection: "row", alignItems: "center", minHeight: OPTION_HEIGHT, gap: space.xl },
  grid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  cell: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingVertical: space.m },
  cellText: { gap: space.xs },
});
