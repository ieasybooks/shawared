import { space } from "@shawared/design";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, type PressState } from "../../components/ui/controls";
import { GirihBand } from "../../components/ui/Girih";
import { Icon } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { SettingsButtons } from "../settings/SettingsControls";

export const PHONE_BAR_INSET = space.m;
export const PHONE_BAR_BUTTON_SIZE = 38;

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
      <GirihBand height={insets.top + 64} />
      {center && (
        <View pointerEvents="box-none" style={[styles.center, { top: insets.top + space.s }]}>
          {center}
        </View>
      )}
      {back && (
        <IconButton
          icon="back"
          label={t(lang, "back")}
          onPress={goBack}
          size={PHONE_BAR_BUTTON_SIZE}
          iconSize={20}
          color={palette.fg}
          glass
        />
      )}
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
      <SettingsButtons size={PHONE_BAR_BUTTON_SIZE} about={!!lead && !title} />
    </View>
  );
}

/**
 * The top of the page column on wide windows, over the girih band: back on pages opened from
 * another, and the settings at the other end.
 */
export function WideToolbar({ back }: { back?: boolean | undefined }) {
  const { palette, lang } = useSettings();
  const type = useType();
  const goBack = useGoBack();
  return (
    <View style={styles.wide}>
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(lang, "back")}
          onPress={goBack}
          style={(s: PressState) => [styles.backPill, (s.hovered || s.pressed) && { backgroundColor: palette.fold }]}
        >
          <Icon name="back" size={18} color={palette.muted} />
          <Text style={[type.controlStrong, { color: palette.muted }]}>{t(lang, "back")}</Text>
        </Pressable>
      )}
      <View style={styles.title} />
      <SettingsButtons about />
    </View>
  );
}

const styles = StyleSheet.create({
  wide: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingTop: 28,
    paddingBottom: space.m,
    paddingHorizontal: 32,
    minHeight: 74,
    zIndex: 2,
  },
  backPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    height: 36,
    borderRadius: 18,
    paddingStart: space.s,
    paddingEnd: space.l,
    marginStart: -space.m,
  },
  bar: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingHorizontal: PHONE_BAR_INSET, paddingBottom: space.s, zIndex: 2 },
  center: { position: "absolute", start: 0, end: 0, bottom: space.s, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, minWidth: 0 },
  // Without a back button the title lines up with the page's text.
  titleAlone: { paddingStart: space.m },
});
