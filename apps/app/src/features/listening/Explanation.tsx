import { space } from "@shawared/design";
import { notesOfBayt, type WordHit } from "@shawared/listening";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View, type HostInstance } from "react-native";
import { Chip, IconButton, Nuqta, Tag } from "../../components/ui/controls";
import { Dir } from "../../components/ui/Dir";
import { Half } from "../../components/ui/Measure";
import { t } from "../../lib/i18n";
import { isWide, Only, useLayout } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { useReveal } from "./PanelScroll";
import { useCurrentLine } from "./playback";
import { useCurrentBayt, useListening } from "./state";

/** What the explanation shows: the held bayt or the introduction, else the bayt being recited. */
export function usePanel(): number | "intro" {
  const { pinned } = useListening();
  const current = useCurrentBayt();
  return pinned ?? current;
}

/**
 * One block for both the phone sheet and the side panel of wide windows: the poem's
 * introduction, or one bayt explained. `onCollapse` puts the sheet away (phones only).
 */
export function Explanation({ onCollapse }: { onCollapse?: () => void }) {
  const { abyat, sources, source, setSourceId, words, pinned, unpin, followRef, playback, bundle, intro, focus } = useListening();
  const { palette, lang, start } = useSettings();
  const type = useType();
  const layout = useLayout();
  const current = useCurrentBayt();
  const line = useCurrentLine(playback);
  const view = usePanel();
  const subjects = bundle.poem.themes?.slice(1) ?? [];
  const n = view === "intro" ? current : view;
  const bayt = abyat.find((b) => b.n === n)!;
  const sharh = source?.abyat[n]?.sharh;
  const notes = notesOfBayt(words, n);
  const live = view === n && n === current && line >= 0;
  const liveHalf = live ? (playback.track.lines[line]?.half ?? null) : null;
  const focused = focus ? words.get(focus)?.address : undefined;

  // A short fade when what it shows changes.
  const fade = useRef(new Animated.Value(1)).current;
  const key = `${view}|${source?.id ?? ""}|${lang}`;
  const last = useRef(key);
  useEffect(() => {
    if (last.current === key) return;
    last.current = key;
    fade.setValue(0.1);
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  }, [key, fade]);

  const verseColor = (h: 1 | 2) => (live && (liveHalf === null || liveHalf === h) ? palette.accent : palette.fg);
  // Back to following: from a held bayt, or from the introduction once the recitation is under way.
  const showNowPlaying = view === "intro" ? line >= 0 : pinned !== null && pinned !== current;

  return (
    <View style={styles.ex}>
      <View style={styles.head}>
        <View style={styles.title}>
          <Nuqta />
          <Text style={[type.bodyStrong, { color: palette.fg }]}>
            {view === "intro" ? t(lang, "about") : `${t(lang, "verse", { n })} · ${t(lang, "expl")}`}
          </Text>
        </View>
        <View style={styles.sp} />
        {showNowPlaying && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              unpin();
              followRef.current?.();
            }}
            style={[styles.np, { borderColor: palette.accent }]}
          >
            <Nuqta />
            <Text style={[type.label, { color: palette.accent }]}>{t(lang, "nowPlaying")}</Text>
          </Pressable>
        )}
        {onCollapse && (
          <Only on="phone">
            <IconButton icon="down" label={t(lang, "collapse")} onPress={onCollapse} size={36} iconSize={20} />
          </Only>
        )}
      </View>

      <Animated.View style={[styles.body, { opacity: fade }]}>
        {view === "intro" ? (
          <>
            {intro && <Text style={[type.prose, { color: palette.fg, textAlign: start }]}>{intro}</Text>}
            {subjects.length > 0 && (
              <View style={styles.body}>
                <Text style={[type.labelStrong, { color: palette.muted, textAlign: start }]}>{t(lang, "otherSubjects")}</Text>
                <View style={styles.sources}>
                  {subjects.map((subject) => (
                    <Chip key={subject.id}>{subject.name}</Chip>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            {/* In the phone's sheet on the fold; in the sidebar, a card on it. */}
            <Dir
              dir="rtl"
              lang="ar"
              style={[
                styles.verse,
                { backgroundColor: layout.value(palette.fold, palette.raise), borderColor: layout.value("transparent", palette.line) },
              ]}
            >
              <Half
                text={bayt.sadr}
                kashida={bundle.poem.kashida[`${bayt.n}.1`]}
                measure={bundle.poem.measure}
                style={[type.verseSmall, { color: verseColor(1) }]}
                side="start"
                indent="10%"
              />
              <Half
                text={bayt.ajuz}
                kashida={bundle.poem.kashida[`${bayt.n}.2`]}
                measure={bundle.poem.measure}
                style={[type.verseSmall, { color: verseColor(2) }]}
                side="end"
                indent="10%"
              />
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

            {sharh && <Text style={[type.prose, { color: palette.fg, textAlign: start }]}>{sharh}</Text>}

            {notes.length > 0 && (
              <View>
                <View style={styles.wordsTitle}>
                  <Text style={[type.labelStrong, { color: palette.muted, textAlign: start }]}>{t(lang, "words")}</Text>
                </View>
                {notes.map((hit) => (
                  <WordNote key={hit.address} hit={hit} focused={hit.address === focused} />
                ))}
              </View>
            )}
          </>
        )}
      </Animated.View>
    </View>
  );
}

/** One word's meaning; the word just tapped in the verse is brought forward and into view. */
function WordNote({ hit, focused }: { hit: WordHit; focused: boolean }) {
  const { palette, lang, start } = useSettings();
  const type = useType();
  const reveal = useReveal();
  const ref = useRef<HostInstance>(null);
  useEffect(() => {
    if (!focused) return;
    // On phones the sheet slides up first.
    const id = setTimeout(() => reveal(ref.current), isWide() ? 60 : 380);
    return () => clearTimeout(id);
  }, [focused, reveal]);
  return (
    <View
      ref={ref}
      aria-current={focused ? "true" : undefined}
      style={[
        styles.word,
        { borderTopColor: palette.line },
        focused && [styles.focused, { backgroundColor: palette.accentSoft, borderTopColor: "transparent" }],
      ]}
    >
      <View style={styles.wordHead}>
        {focused && <Nuqta />}
        <Text style={[type.noteHead, { color: palette.fg }]}>{hit.note.head ?? hit.note.word}</Text>
        {hit.note.root && <Tag>{t(lang, "root", { r: hit.note.root })}</Tag>}
      </View>
      <Text style={[type.proseSmall, { color: focused ? palette.fg : palette.muted, textAlign: start }]}>{hit.note.meaning}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ex: { gap: space.l },
  head: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 36 },
  title: { flexDirection: "row", alignItems: "center", gap: space.m },
  sp: { flex: 1 },
  np: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    minHeight: 28,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: space.l,
  },
  body: { gap: space.l },
  verse: { borderRadius: 12, borderWidth: 1, paddingVertical: space.m, paddingHorizontal: 14 },
  sources: { flexDirection: "row", gap: space.s, flexWrap: "wrap" },
  wordsTitle: { paddingBottom: space.m },
  word: { borderTopWidth: 1, paddingVertical: space.l, gap: space.s },
  wordHead: { flexDirection: "row", alignItems: "center", gap: space.m, flexWrap: "wrap" },
  // The tint reaches past the text, which stays in line with the rest.
  focused: { marginHorizontal: -space.m, paddingHorizontal: space.m, borderRadius: 10 },
});
