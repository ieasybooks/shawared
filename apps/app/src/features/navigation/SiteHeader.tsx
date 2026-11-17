import { space } from "@shawared/design";
import { usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { TextLink } from "../../components/ui/TextLink";
import { t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { SettingsButtons } from "../settings/SettingsControls";
import { TABS, tabOf } from "./tabs";

/** The header of wide windows: the wordmark, the four sections, the settings and About. */
export function SiteHeader() {
  const { palette, lang, href } = useSettings();
  const type = useType();
  const current = tabOf(usePathname());
  return (
    <View style={[styles.header, { backgroundColor: palette.bg, borderBottomColor: palette.line }]}>
      <TextLink href={href(paths.home)}>
        <Text style={[type.wordmarkSmall, { color: palette.fg }]}>{t(lang, "brand")}</Text>
      </TextLink>
      <View role="navigation" style={styles.nav}>
        {TABS.map((tab) => {
          const on = tab.name === current;
          return (
            <TextLink key={tab.name} href={href(tab.path)} current={on} style={styles.navItem}>
              <Text style={[on ? type.controlStrong : type.control, { color: on ? palette.fg : palette.muted }]}>{t(lang, tab.label)}</Text>
            </TextLink>
          );
        })}
      </View>
      <View style={styles.flex} />
      <SettingsButtons about />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, flexDirection: "row", alignItems: "center", gap: 28, paddingHorizontal: 22, borderBottomWidth: 1 },
  nav: { flexDirection: "row", alignItems: "center", gap: space.xxl },
  navItem: { paddingVertical: space.m },
  flex: { flex: 1 },
});
