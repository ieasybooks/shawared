import { fonts } from "@shawared/design";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";

/** Loading and failure, for a whole screen. */
export function StateView({ error, onRetry }: { error?: Error | undefined; onRetry?: () => void }) {
  const { lang, palette } = useSettings();
  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      {error ? (
        <>
          <Text style={[styles.text, { color: palette.fg, fontFamily: fonts.uiMedium }]}>{t(lang, "loadError")}</Text>
          {onRetry && (
            <Pressable accessibilityRole="button" onPress={onRetry} style={[styles.btn, { borderColor: palette.accent }]}>
              <Text style={[styles.btnText, { color: palette.accent, fontFamily: fonts.ui }]}>{t(lang, "retry")}</Text>
            </Pressable>
          )}
        </>
      ) : (
        <ActivityIndicator color={palette.accent} accessibilityLabel={t(lang, "loading")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  text: { fontSize: 16 },
  btn: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 },
  btnText: { fontSize: 14 },
});
