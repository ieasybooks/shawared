import { space } from "@shawared/design";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "../../components/ui/controls";
import { t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { SettingsButtons } from "../settings/SettingsControls";

/** Back one page, or home when the page was opened directly. */
export function useGoBack() {
  const { href } = useSettings();
  return () => (router.canGoBack() ? router.back() : router.replace(href(paths.home)));
}

/**
 * The bar at the top of every page on phones: back (on pages you open from another), the
 * page's title (or the wordmark at home), and the settings. It stays put while the page
 * scrolls. Wide windows have the site header instead.
 */
export function TopBar({
  back,
  title,
  lead,
  center,
}: {
  back?: boolean | undefined;
  title?: string | undefined;
  lead?: ReactNode;
  center?: ReactNode;
}) {
  const { palette, lang, start } = useSettings();
  const type = useType();
  const insets = useSafeAreaInsets();
  const goBack = useGoBack();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.s, backgroundColor: palette.bg }]}>
      {center && (
        <View pointerEvents="box-none" style={[styles.center, { top: insets.top + space.s }]}>
          {center}
        </View>
      )}
      {back && <IconButton icon="back" label={t(lang, "back")} onPress={goBack} />}
      <View style={[styles.title, !back && styles.titleAlone]}>
        {title ? (
          <Text numberOfLines={1} accessibilityRole="header" style={[type.barTitle, { color: palette.fg, textAlign: start }]}>
            {title}
          </Text>
        ) : (
          lead
        )}
      </View>
      {/* At home, where the wordmark leads, the bar also opens About Shawared. */}
      <SettingsButtons about={!!lead && !title} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingHorizontal: space.m, paddingBottom: space.s, zIndex: 2 },
  center: { position: "absolute", start: 0, end: 0, bottom: space.s, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, minWidth: 0 },
  // Without a back button the title lines up with the page's text.
  titleAlone: { paddingStart: space.m },
});
