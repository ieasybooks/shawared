import { fonts } from "@shawared/design";
import { Link, router } from "expo-router";
import Head from "expo-router/head";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, Nuqta } from "../../components/ui/controls";
import { StateView } from "../../components/ui/StateView";
import { useCatalog, usePoemBundle } from "../../lib/content";
import { abyatCount, t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";

export function PoetScreen({ id }: { id: string }) {
  const { data, error, retry } = useCatalog();
  const { palette, lang, rtl } = useSettings();
  const insets = useSafeAreaInsets();
  const poems = data?.poems.filter((p) => p.poet === id) ?? [];
  // The bio lives in the poem bundles; any of the poet's poems has it.
  const bundle = usePoemBundle(poems[0]?.id, lang).data;
  if (!data) return <StateView error={error} onRetry={retry} />;
  const poet = data.poets[id];
  if (!poet) return <StateView error={new Error("unknown poet")} />;
  const name = lang === "ar" ? poet.name : (poet.names[lang] ?? poet.name);
  const align = rtl ? "right" : "left";
  return (
    <ScrollView style={{ backgroundColor: palette.bg }} contentContainerStyle={[styles.page, { paddingTop: insets.top + 8 }]}>
      <Head>
        <title>{`${name} · ${t(lang, "brand")}`}</title>
      </Head>
      <View style={styles.inner}>
        <IconButton
          icon="back"
          label={t(lang, "back")}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          flip={!rtl}
        />
        <Text style={[styles.name, { color: palette.fg, textAlign: align }]}>{name}</Text>
        {lang !== "ar" && <Text style={[styles.arName, { color: palette.muted, textAlign: align }]}>{poet.name}</Text>}
        {poet.died && (
          <Text style={[styles.died, { color: palette.muted, textAlign: align, fontFamily: fonts.ui }]}>
            {t(lang, "died", { h: poet.died.hijri, c: poet.died.ce })}
          </Text>
        )}
        {bundle?.poet.bio && (
          <Text
            style={[
              styles.bio,
              { color: palette.fg, textAlign: align, fontFamily: lang === "en" ? fonts.translation : fonts.ui },
              lang === "en" && styles.bioEn,
            ]}
          >
            {bundle.poet.bio}
          </Text>
        )}
        <View style={styles.sectionHead}>
          <Nuqta size={8} />
          <Text style={[styles.section, { color: palette.fg, fontFamily: fonts.uiMedium }]}>{t(lang, "poems")}</Text>
        </View>
        {poems.map((p) => (
          <Link key={p.id} href={`/poems/${p.id}`} asChild>
            <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.row, { borderColor: palette.line }])}>
              <Text style={[styles.title, { color: palette.fg }]}>{p.title}</Text>
              <Text style={[styles.facts, { color: palette.muted, fontFamily: fonts.ui }]}>{abyatCount(p.abyat, lang)}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 60, alignItems: "center" },
  inner: { width: "100%", maxWidth: 720, gap: 10 },
  name: { fontFamily: fonts.display, fontSize: 34, lineHeight: 52 },
  arName: { fontFamily: fonts.verseBold, fontSize: 22, lineHeight: 34 },
  died: { fontSize: 13 },
  bio: { fontSize: 15, lineHeight: 28, marginTop: 8 },
  bioEn: { fontSize: 17, lineHeight: 27 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22 },
  section: { fontSize: 18 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, paddingVertical: 12, gap: 12 },
  title: { fontFamily: fonts.verseBold, fontSize: 21, lineHeight: 34, writingDirection: "rtl" },
  facts: { fontSize: 12 },
});
