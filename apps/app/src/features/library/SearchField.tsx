import { space } from "@shawared/design";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { inputAlign } from "../../lib/align";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (q: string) => void; placeholder?: string }) {
  const { palette, lang, rtl } = useSettings();
  const type = useType();
  // A text input keeps its own box, so it takes the role's font and size but not the trim.
  const { fontFamily, fontSize } = type.control;
  return (
    <View style={[styles.field, { borderColor: palette.line, backgroundColor: palette.raise }]}>
      <Icon name="search" size={18} color={palette.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? t(lang, "search")}
        placeholderTextColor={palette.muted}
        accessibilityLabel={placeholder ?? t(lang, "search")}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={[styles.input, { fontFamily, fontSize, color: palette.fg, textAlign: inputAlign(rtl ? "rtl" : "ltr") }]}
      />
      {value.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel={t(lang, "clearSearch")} onPress={() => onChange("")} style={styles.clear}>
          <Icon name="close" size={16} color={palette.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: space.xl,
  },
  input: { flex: 1, minWidth: 0, paddingVertical: space.m, outlineStyle: "none" } as object,
  clear: { padding: space.xs },
});
