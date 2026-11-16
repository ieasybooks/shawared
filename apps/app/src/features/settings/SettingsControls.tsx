import { StyleSheet, View } from "react-native";
import { Segmented } from "../../components/ui/controls";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";

export function SettingsControls({ vertical = false }: { vertical?: boolean }) {
  const { lang, theme, setLang, setTheme } = useSettings();
  return (
    <View style={[styles.row, vertical && styles.col]}>
      <Segmented
        label={t(lang, "language")}
        value={lang}
        onChange={setLang}
        options={[
          { value: "ar", label: "العربية" },
          { value: "en", label: "English" },
        ]}
      />
      <Segmented
        label={t(lang, "theme")}
        value={theme}
        onChange={setTheme}
        options={[
          { value: "day", label: t(lang, "day") },
          { value: "night", label: t(lang, "night") },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" },
  col: { flexDirection: "column", alignItems: "stretch", gap: 12 },
});
