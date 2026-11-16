import { fonts } from "@shawared/design";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "../../components/ui/controls";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useListening } from "./state";

/** A word's meaning, opened from a word with a rhombus. */
export function WordCard({ compact = false }: { compact?: boolean }) {
  const { gloss, closeGloss, words } = useListening();
  const { palette, lang, rtl } = useSettings();
  if (!gloss) return null;
  const hit = words.get(gloss.key);
  if (!hit) return null;
  const align = rtl ? "right" : "left";
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={[styles.word, compact && styles.wordCompact, { color: palette.fg }]}>{hit.note.head ?? hit.note.word}</Text>
        {hit.note.root && (
          <Text style={[styles.root, { color: palette.muted, borderColor: palette.line, fontFamily: fonts.ui }]}>
            {t(lang, "root", { r: hit.note.root })}
          </Text>
        )}
        <View style={styles.sp} />
        <IconButton icon="close" label={t(lang, "close")} onPress={closeGloss} size={compact ? 34 : 42} iconSize={compact ? 18 : 22} />
      </View>
      <Text
        style={[
          styles.meaning,
          compact && styles.meaningCompact,
          { color: palette.fg, textAlign: align, fontFamily: lang === "en" ? fonts.translation : fonts.ui },
        ]}
      >
        {hit.note.meaning}
      </Text>
      <Text style={[styles.ctx, { color: palette.muted, textAlign: align, fontFamily: fonts.ui }]}>
        {t(lang, "ctx", { n: gloss.n, half: t(lang, gloss.half === 1 ? "sadr" : "ajuz") })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  word: { fontFamily: fonts.verseBold, fontSize: 31, lineHeight: 48, writingDirection: "rtl" },
  wordCompact: { fontSize: 27, lineHeight: 42 },
  root: { fontSize: 12, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, lineHeight: 20 },
  sp: { flex: 1 },
  meaning: { fontSize: 14, lineHeight: 26 },
  meaningCompact: { fontSize: 13.5, lineHeight: 24 },
  ctx: { fontSize: 12, marginTop: 4 },
});
