import { space } from "@shawared/design";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";

/** Loading and failure, for a whole screen; or, with `message`, why there is nothing to show. */
export function StateView({ error, onRetry, message }: { error?: Error | undefined; onRetry?: () => void; message?: string }) {
  const { lang, palette } = useSettings();
  const type = useType();
  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      {message ? (
        <Text style={[type.heading, styles.message, { color: palette.fg }]}>{message}</Text>
      ) : error ? (
        <>
          <Text style={[type.heading, { color: palette.fg }]}>{t(lang, "loadError")}</Text>
          {onRetry && (
            <Pressable accessibilityRole="button" onPress={onRetry} style={[styles.btn, { borderColor: palette.accent }]}>
              <Text style={[type.control, { color: palette.accent }]}>{t(lang, "retry")}</Text>
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
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.xl, padding: space.xxl },
  message: { textAlign: "center" },
  btn: { minHeight: 36, justifyContent: "center", borderWidth: 1, borderRadius: 999, paddingHorizontal: space.xl },
});
