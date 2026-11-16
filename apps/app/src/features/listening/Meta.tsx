import { fonts } from "@shawared/design";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Chip, TogglePill } from "../../components/ui/controls";
import { abyatCount, meterName, rhymeName, t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useListening } from "./state";

/** Title, translated title, meter, rhyme, count and the translation switch. */
export function Meta({ wide = false }: { wide?: boolean }) {
  const { bundle, hasTranslation, trOn, setTrOn, sources } = useListening();
  const { palette, lang } = useSettings();
  const { poem } = bundle;
  const enTitle = lang === "en" ? sources.find((s) => s.title)?.title : undefined;
  const pill = hasTranslation ? <TogglePill label={t(lang, "translation")} on={trOn} onPress={() => setTrOn(!trOn)} /> : null;
  return (
    <View style={[styles.meta, wide && styles.metaWide]}>
      {wide && (
        <Link href={`/poets/${bundle.poet.id}`} asChild>
          <Pressable accessibilityRole="link">
            <Text style={[styles.from, { color: palette.muted, fontFamily: fonts.ui }]}>
              {t(lang, "by")} {bundle.poet.name}
            </Text>
          </Pressable>
        </Link>
      )}
      <View style={styles.titleRow}>
        <Text style={[styles.title, wide && styles.titleWide, { color: palette.fg }]}>{poem.title}</Text>
        {!wide && <View style={styles.sp} />}
        {!wide && pill}
      </View>
      {enTitle && <Text style={[styles.sub, { color: palette.muted }]}>{enTitle}</Text>}
      <View style={styles.chips}>
        <Chip>{meterName(poem.meter, lang)}</Chip>
        {poem.rawiy && <Chip>{rhymeName(poem.rawiy, lang)}</Chip>}
        <Chip ghost>{abyatCount(poem.abyat.length, lang)}</Chip>
        {wide && <View style={styles.sp} />}
        {wide && pill}
      </View>
    </View>
  );
}

/** The poem's introduction and the poet, folded to a few lines. */
export function About({ folded = true }: { folded?: boolean }) {
  const { sources, bundle } = useListening();
  const { palette, lang, rtl } = useSettings();
  const [open, setOpen] = useState(!folded);
  const intro = sources.find((s) => s.intro)?.intro;
  if (!intro && !bundle.poet.bio) return null;
  const align = rtl ? "right" : "left";
  const body = { color: palette.muted, textAlign: align, fontFamily: lang === "en" ? fonts.translation : fonts.ui } as const;
  return (
    <View style={[styles.about, { borderColor: palette.line }]}>
      <Text style={[styles.aboutTitle, { color: palette.fg, textAlign: align, fontFamily: fonts.uiMedium }]}>{t(lang, "about")}</Text>
      {intro && (
        <Text style={[styles.aboutText, lang === "en" && styles.aboutEn, body]} {...(open ? {} : { numberOfLines: 3 })}>
          {intro}
        </Text>
      )}
      {open && bundle.poet.bio && (
        <>
          <Text style={[styles.aboutTitle, styles.aboutPoet, { color: palette.fg, textAlign: align, fontFamily: fonts.uiMedium }]}>
            {t(lang, "aboutPoet")} · {bundle.poet.name}
          </Text>
          <Text style={[styles.aboutText, lang === "en" && styles.aboutEn, body]}>{bundle.poet.bio}</Text>
        </>
      )}
      <Pressable accessibilityRole="button" onPress={() => setOpen(!open)} style={styles.more}>
        <Text style={[styles.moreText, { color: palette.accent, textAlign: align, fontFamily: fonts.ui }]}>
          {t(lang, open ? "readLess" : "readMore")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: { paddingTop: 4, paddingHorizontal: 20, paddingBottom: 2, gap: 5 },
  metaWide: { paddingTop: 16, paddingHorizontal: 36, gap: 4 },
  from: { fontSize: 12, lineHeight: 18 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontFamily: fonts.verseBold, fontSize: 26, lineHeight: 40, writingDirection: "rtl", flexShrink: 1 },
  titleWide: { fontSize: 28, lineHeight: 42 },
  sub: { fontFamily: fonts.translationItalic, fontSize: 14, lineHeight: 20 },
  chips: { flexDirection: "row", gap: 6, flexWrap: "wrap", alignItems: "center" },
  sp: { flex: 1 },
  about: { borderWidth: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, gap: 6 },
  aboutTitle: { fontSize: 12 },
  aboutPoet: { marginTop: 8 },
  aboutText: { fontSize: 13, lineHeight: 23 },
  aboutEn: { fontSize: 14.5, lineHeight: 22 },
  more: { alignSelf: "stretch" },
  moreText: { fontSize: 12 },
});
