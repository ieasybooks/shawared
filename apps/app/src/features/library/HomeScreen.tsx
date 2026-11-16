import type { Catalog, CatalogPoem } from "@shawared/contracts";
import { fonts } from "@shawared/design";
import { Link } from "expo-router";
import Head from "expo-router/head";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Nuqta } from "../../components/ui/controls";
import { Dir } from "../../components/ui/Dir";
import { Icon, Logo } from "../../components/ui/Icon";
import { StateView } from "../../components/ui/StateView";
import { useCatalog } from "../../lib/content";
import { abyatCount, clock, meterName, t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { SettingsControls } from "../settings/SettingsControls";

export function HomeScreen() {
  const { data, error, retry } = useCatalog();
  const { palette, lang, rtl } = useSettings();
  const insets = useSafeAreaInsets();
  if (!data) return <StateView error={error} onRetry={retry} />;
  const align = rtl ? "right" : "left";
  return (
    <ScrollView style={{ backgroundColor: palette.bg }} contentContainerStyle={[styles.page, { paddingTop: insets.top + 20 }]}>
      <Head>
        <title>{t(lang, "brand")}</title>
      </Head>
      <View style={styles.inner}>
        <View style={styles.head}>
          <View style={styles.brand}>
            <Logo size={44} color={palette.fg} dot={palette.accent} />
            <Text style={[styles.wordmark, { color: palette.fg }]}>{t(lang, "brand")}</Text>
          </View>
          <SettingsControls />
        </View>
        <Text
          style={[styles.tagline, { color: palette.muted, textAlign: align, fontFamily: lang === "en" ? fonts.translation : fonts.ui }]}
        >
          {t(lang, "tagline")}
        </Text>

        <View style={styles.sectionHead}>
          <Nuqta size={8} />
          <Text style={[styles.section, { color: palette.fg, fontFamily: fonts.uiMedium }]}>{t(lang, "poems")}</Text>
        </View>
        <View style={styles.grid}>
          {data.poems.map((p) => (
            <PoemCard key={p.id} poem={p} catalog={data} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function PoemCard({ poem, catalog }: { poem: CatalogPoem; catalog: Catalog }) {
  const { palette, lang, rtl } = useSettings();
  const poet = catalog.poets[poem.poet];
  const rec = poem.recitations[0];
  const reciter = rec ? catalog.reciters[rec.reciter] : undefined;
  const name = (p: { name: string; names: Record<string, string> } | undefined) =>
    p ? (lang === "ar" ? p.name : (p.names[lang] ?? p.name)) : "";
  const align = rtl ? "right" : "left";
  const facts = [meterName(poem.meter, lang), abyatCount(poem.abyat, lang), rec ? clock(rec.duration, lang) : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link href={`/poems/${poem.id}`} asChild>
      <Pressable
        accessibilityRole="link"
        style={StyleSheet.flatten([
          styles.card,
          { backgroundColor: palette.raise, borderColor: palette.line, shadowColor: palette.shadow },
        ])}
      >
        <View style={styles.cardTop}>
          <View style={styles.flex}>
            <Text style={[styles.title, { color: palette.fg }]}>{poem.title}</Text>
            {lang === "en" && poem.titles.en && <Text style={[styles.sub, { color: palette.muted }]}>{poem.titles.en}</Text>}
          </View>
          <View style={[styles.play, { backgroundColor: palette.fg }]}>
            <Icon name="play" size={18} color={palette.bg} />
          </View>
        </View>
        <Dir dir="rtl" lang="ar" style={[styles.opening, { backgroundColor: palette.fold }]}>
          <Text style={[styles.verse, styles.sadr, { color: palette.partner }]}>{poem.opening.sadr}</Text>
          <Text style={[styles.verse, styles.ajuz, { color: palette.partner }]}>{poem.opening.ajuz}</Text>
        </Dir>
        <Text style={[styles.byline, { color: palette.fg, textAlign: align, fontFamily: fonts.uiMedium }]}>
          {name(poet)}
          {reciter ? (
            <Text style={{ color: palette.muted, fontFamily: fonts.ui }}>
              {" · "}
              {t(lang, "recitedBy", { name: name(reciter) })}
            </Text>
          ) : null}
        </Text>
        <Text style={[styles.facts, { color: palette.muted, textAlign: align, fontFamily: fonts.ui }]}>{facts}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 60, alignItems: "center" },
  inner: { width: "100%", maxWidth: 1080, gap: 18 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 },
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  wordmark: { fontFamily: fonts.display, fontSize: 32, lineHeight: 44 },
  tagline: { fontSize: 17, lineHeight: 28, maxWidth: 620 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  section: { fontSize: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  card: {
    flexGrow: 1,
    flexBasis: 320,
    maxWidth: 520,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 4,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  title: { fontFamily: fonts.verseBold, fontSize: 25, lineHeight: 40, writingDirection: "rtl", textAlign: "right" },
  sub: { fontFamily: fonts.translationItalic, fontSize: 14, lineHeight: 20 },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  opening: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  verse: { fontFamily: fonts.verse, fontSize: 17, lineHeight: 33, writingDirection: "rtl" },
  sadr: { textAlign: "right", paddingLeft: "12%" },
  ajuz: { textAlign: "left", paddingRight: "12%" },
  byline: { fontSize: 14, lineHeight: 22 },
  facts: { fontSize: 12, lineHeight: 18, marginTop: -8 },
});
