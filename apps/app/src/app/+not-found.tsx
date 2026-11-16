import { space } from "@shawared/design";
import { StyleSheet, Text, View } from "react-native";
import { TextLink } from "../components/ui/TextLink";
import { t } from "../lib/i18n";
import { useSettings } from "../lib/settings";
import { useType } from "../lib/type";

export default function NotFound() {
  const { palette, lang, href } = useSettings();
  const type = useType();
  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      <Text style={[type.heading, { color: palette.fg }]}>{t(lang, "notFound")}</Text>
      <TextLink href={href("/")}>
        <Text style={[type.control, { color: palette.accent }]}>{t(lang, "home")}</Text>
      </TextLink>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.l },
});
