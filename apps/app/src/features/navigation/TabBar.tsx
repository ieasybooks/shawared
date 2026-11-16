import { space } from "@shawared/design";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Nuqta } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { MiniPlayer } from "../player/MiniPlayer";
import { useWide } from "./layout";
import { TABS, tabOf } from "./tabs";

/**
 * The bottom of every tab screen: the mini player, then the tabs. Ours rather than the
 * system's, so the tabs follow the app's language and run right to left in Arabic.
 * Wide windows show the tabs in the header instead and keep only the mini player.
 */
export function TabBar() {
  const { palette, lang, href } = useSettings();
  const type = useType();
  const insets = useSafeAreaInsets();
  const wide = useWide();
  const current = tabOf(usePathname());
  if (wide) return <MiniPlayer />;
  return (
    <View>
      <MiniPlayer />
      <View
        accessibilityRole="tablist"
        style={[styles.bar, { backgroundColor: palette.bg, borderTopColor: palette.line, paddingBottom: insets.bottom + space.s }]}
      >
        {TABS.map((tab) => {
          const on = tab.name === current;
          const color = on ? palette.fg : palette.muted;
          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              aria-selected={on}
              accessibilityLabel={t(lang, tab.label)}
              onPress={() => router.navigate(href(tab.path))}
              style={styles.tab}
            >
              <Icon name={tab.icon} size={23} color={color} />
              <Text style={[on ? type.captionStrong : type.caption, { color }]}>{t(lang, tab.label)}</Text>
              <Nuqta size={4} style={{ opacity: on ? 1 : 0 }} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", borderTopWidth: 1, paddingTop: space.s },
  tab: { flex: 1, alignItems: "center", gap: space.xs, minHeight: 48 },
});
