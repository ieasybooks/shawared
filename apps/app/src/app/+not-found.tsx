import { fonts } from "@shawared/design";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { t } from "../lib/i18n";
import { useSettings } from "../lib/settings";

export default function NotFound() {
  const { palette, lang } = useSettings();
  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.fg, fontFamily: fonts.uiMedium }]}>{t(lang, "notFound")}</Text>
      <Link href="/" style={[styles.link, { color: palette.accent, fontFamily: fonts.ui }]}>
        {t(lang, "home")}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  text: { fontSize: 18 },
  link: { fontSize: 15 },
});
