import { fonts } from "@shawared/design";
import { notesOfBayt } from "@shawared/listening";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Chip, IconButton, Nuqta } from "../../components/ui/controls";
import { Dir } from "../../components/ui/Dir";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useCurrentLine } from "./playback";
import { useCurrentBayt, useListening } from "./state";

/** The bayt the explanation shows: the held one, else the one being recited. */
export function usePanelBayt() {
  const { pinned } = useListening();
  const current = useCurrentBayt();
  return pinned ?? current;
}

/** One block for both the phone sheet and the web side panel. */
export function Explanation({ onCollapse }: { onCollapse?: () => void }) {
  const { abyat, sources, source, setSourceId, words, pinned, unpin, followRef, playback } = useListening();
  const { palette, lang, rtl } = useSettings();
  const current = useCurrentBayt();
  const line = useCurrentLine(playback);
  const n = usePanelBayt();
  const bayt = abyat.find((b) => b.n === n)!;
  const sharh = source?.abyat[n]?.sharh;
  const notes = notesOfBayt(words, n);
  const live = n === current && line >= 0;
  const liveHalf = live ? (playback.track.lines[line]?.half ?? null) : null;
  const align = rtl ? "right" : "left";

  // A short fade when the bayt or the source changes.
  const fade = useRef(new Animated.Value(1)).current;
  const key = `${n}|${source?.id ?? ""}|${lang}`;
  const last = useRef(key);
  useEffect(() => {
    if (last.current === key) return;
    last.current = key;
    fade.setValue(0.1);
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  }, [key, fade]);

  const verseColor = (h: 1 | 2) => (live ? (liveHalf === null || liveHalf === h ? palette.fg : palette.partner) : palette.rest);

  return (
    <View style={styles.ex}>
      <View style={styles.head}>
        <View style={styles.title}>
          <Nuqta />
          <Text style={[styles.titleText, { color: palette.fg, fontFamily: fonts.uiMedium }]}>
            {t(lang, "verse", { n })} · {t(lang, "expl")}
          </Text>
        </View>
        <View style={styles.sp} />
        {pinned !== null && pinned !== current && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              unpin();
              followRef.current?.();
            }}
            style={[styles.np, { borderColor: palette.accent }]}
          >
            <Nuqta />
            <Text style={[styles.npText, { color: palette.accent, fontFamily: fonts.ui }]}>{t(lang, "nowPlaying")}</Text>
          </Pressable>
        )}
        {onCollapse && <IconButton icon="down" label={t(lang, "collapse")} onPress={onCollapse} size={36} iconSize={20} />}
      </View>

      <Animated.View style={[styles.body, { opacity: fade }]}>
        <Dir dir="rtl" lang="ar" style={[styles.verse, { backgroundColor: palette.fold }]}>
          <Text style={[styles.verseText, styles.sadr, { color: verseColor(1) }]}>{bayt.sadr}</Text>
          <Text style={[styles.verseText, styles.ajuz, { color: verseColor(2) }]}>{bayt.ajuz}</Text>
        </Dir>

        {sources.length > 1 && (
          <View accessibilityRole="radiogroup" accessibilityLabel={t(lang, "sources")} style={styles.sources}>
            {sources.map((s) => (
              <Chip key={s.id} active={s.id === source?.id} onPress={() => setSourceId(s.id)}>
                {s.name}
              </Chip>
            ))}
          </View>
        )}

        {sharh && (
          <Text
            style={[
              styles.sharh,
              { color: palette.fg, textAlign: align, fontFamily: lang === "en" ? fonts.translation : fonts.ui },
              lang === "en" && styles.sharhEn,
            ]}
          >
            {sharh}
          </Text>
        )}

        {notes.length > 0 && (
          <View style={styles.words}>
            <Text style={[styles.wordsTitle, { color: palette.muted, textAlign: align, fontFamily: fonts.uiMedium }]}>
              {t(lang, "words")}
            </Text>
            {notes.map((hit) => (
              <View key={hit.address} style={[styles.word, { borderTopColor: palette.line }]}>
                <View style={styles.wordHead}>
                  <Text style={[styles.wordAr, { color: palette.fg }]}>{hit.note.head ?? hit.note.word}</Text>
                  {hit.note.root && (
                    <Text style={[styles.root, { color: palette.muted, borderColor: palette.line, fontFamily: fonts.ui }]}>
                      {t(lang, "root", { r: hit.note.root })}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.meaning,
                    { color: palette.muted, textAlign: align, fontFamily: lang === "en" ? fonts.translation : fonts.ui },
                  ]}
                >
                  {hit.note.meaning}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ex: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 36 },
  title: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleText: { fontSize: 13 },
  sp: { flex: 1 },
  np: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 },
  npText: { fontSize: 12 },
  body: { gap: 12 },
  verse: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  verseText: { fontFamily: fonts.verse, fontSize: 17, lineHeight: 33, writingDirection: "rtl" },
  sadr: { textAlign: "right", paddingLeft: "10%" },
  ajuz: { textAlign: "left", paddingRight: "10%" },
  sources: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  sharh: { fontSize: 14, lineHeight: 27 },
  sharhEn: { fontSize: 15.5, lineHeight: 25 },
  words: { marginTop: 4 },
  wordsTitle: { fontSize: 12, marginBottom: 4 },
  word: { borderTopWidth: 1, paddingVertical: 9, gap: 1 },
  wordHead: { flexDirection: "row", alignItems: "baseline", gap: 10, flexWrap: "wrap" },
  wordAr: { fontFamily: fonts.verseBold, fontSize: 20, lineHeight: 30, writingDirection: "rtl" },
  root: { fontSize: 11, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, lineHeight: 18 },
  meaning: { fontSize: 13, lineHeight: 23 },
});
