import { space } from "@shawared/design";
import { useRef, useState, type RefObject } from "react";
import {
  Modal,
  AccessibilityInfo,
  Platform,
  findNodeHandle,
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
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";

export type DirectoryOrder = "alphabetical" | "byPoemCount" | "byRecordingCount" | "byRhymeLetter";

type SortOptions<T extends DirectoryOrder> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (order: T) => void;
};

export function SortBar<T extends DirectoryOrder>({
  count,
  filter,
  ...sort
}: SortOptions<T> & {
  count: string;
  filter?: { label: string; onClear: () => void } | undefined;
}) {
  const { lang, palette, start } = useSettings();
  const type = useType();
  const trigger = useRef<HostInstance>(null);
  const countRef = useRef<HostInstance>(null);
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.bar}>
      <View style={styles.summary}>
        <Text
          ref={countRef}
          accessible
          {...(Platform.OS === "web" ? { tabIndex: -1 } : {})}
          accessibilityLiveRegion="polite"
          accessibilityLabel={filter ? `${count} · ${filter.label}` : count}
          style={[type.controlStrong, { color: palette.fg, textAlign: start }]}
        >
          {count}
        </Text>
        {filter && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(lang, "clearFilter", { name: filter.label })}
            onPress={() => {
              filter.onClear();
              // The dismissed control must not leave keyboard or screen-reader focus behind.
              if (Platform.OS === "web") countRef.current?.focus();
              else {
                const node = findNodeHandle(countRef.current);
                if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
              }
            }}
            style={styles.filterTarget}
          >
            <View style={[styles.filter, { borderColor: palette.accent, backgroundColor: palette.fold }]}>
              <Text style={[type.label, styles.filterText, { color: palette.fg, textAlign: start }]}>{filter.label}</Text>
              <Icon name="close" size={12} color={palette.muted} />
            </View>
          </Pressable>
        )}
      </View>
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

const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  bar: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 44 },
  summary: { flex: 1, minWidth: 0, flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: space.m },
  filterTarget: { minHeight: 44, maxWidth: "100%", justifyContent: "center" },
  filter: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: space.m,
    borderWidth: 1,
    borderRadius: 999,
  },
  filterText: { flexShrink: 1 },
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
});
