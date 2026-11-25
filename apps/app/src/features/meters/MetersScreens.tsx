import type { Catalog } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StateView } from "../../components/ui/StateView";
import { TextLink } from "../../components/ui/TextLink";
import { useCatalog } from "../../lib/content";
import { METER_FEET, METER_IDS, meterName, poemsCount, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { ARABIC } from "../../lib/align";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { DetailFacts, ListPage, PageFrame, SectionHead } from "../library/Page";
import { PoemRow } from "../library/PoemCard";

/** The sixteen meters of classical Arabic poetry, in their traditional order. */
export function MetersScreen({ initial }: { initial?: { catalog: Catalog } | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { lang } = useSettings();
  const title = t(lang, "meters");
  if (!data)
    return (
      <PageFrame back title={title}>
        <StateView error={error} onRetry={retry} />
      </PageFrame>
    );
  return (
    <ListPage
      back
      title={title}
      data={METER_IDS}
      keyOf={(m) => m}
      renderItem={(m, i) => <MeterRow id={m} count={data.meters[m] ?? 0} first={i === 0} />}
      estimatedItemSize={96}
    />
  );
}

/** A meter in the list: its name, how many poems, and its feet. The `first` has no rule above it. */
function MeterRow({ id, count, first }: { id: string; count: number; first: boolean }) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  return (
    <Link href={href(paths.meter(id))} asChild>
      <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.row, { borderTopColor: palette.line }, first && styles.first])}>
        <View style={styles.rowHead}>
          <Text
            style={[
              lang === "ar" ? type.listTitle : type.heading,
              styles.flex,
              { color: count ? palette.fg : palette.muted, textAlign: start },
            ]}
          >
            {meterName(id, lang)}
          </Text>
          <Text style={[type.label, { color: palette.muted }]}>{poemsCount(count, lang)}</Text>
        </View>
        <View style={[styles.feetCard, { backgroundColor: palette.fold, borderColor: palette.line }]}>
          <Text style={[type.verseSmall, styles.rtl, { color: count ? palette.muted : palette.line2, textAlign: ARABIC.start }]}>
            {METER_FEET[id]}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

/** One meter: its feet, and the poems written in it. */
export function MeterScreen({ id, initial }: { id: string; initial?: { catalog: Catalog } | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const poems = useMemo(() => data?.poems.filter((p) => p.meter === id) ?? [], [data, id]);
  const list = useMemo(() => poems.map((p) => p.id), [poems]);
  const title = meterName(id, lang);
  if (!data)
    return (
      <PageFrame back title={title}>
        <StateView error={error} onRetry={retry} />
      </PageFrame>
    );
  const header = (
    <>
      <DetailFacts arabic={lang === "ar" ? null : meterName(id, "ar")}>
        <TextLink href={href(paths.meters)}>
          <Text style={[type.labelStrong, styles.link, { color: palette.muted, textDecorationColor: palette.line2 }]}>
            {t(lang, "allMeters")}
          </Text>
        </TextLink>
        <View style={styles.feet}>
          <Text style={[type.labelStrong, { color: palette.muted, textAlign: start }]}>{t(lang, "pattern")}</Text>
          <View style={[styles.feetCard, { backgroundColor: palette.fold, borderColor: palette.line }]}>
            <Text style={[type.verse, styles.rtl, { color: palette.fg, textAlign: ARABIC.start }]}>{METER_FEET[id]}</Text>
          </View>
        </View>
      </DetailFacts>
      <SectionHead title={t(lang, "poems")} count={poemsCount(poems.length, lang)} />
    </>
  );
  return (
    <ListPage
      back
      title={title}
      header={header}
      data={poems}
      keyOf={(p) => p.id}
      renderItem={(p) => <PoemRow poem={p} catalog={data} show="poet" list={list} />}
      estimatedItemSize={86}
    />
  );
}

const styles = StyleSheet.create({
  link: { textDecorationLine: "underline" },
  row: { borderTopWidth: 1, paddingVertical: 16, gap: space.m },
  first: { borderTopWidth: 0 },
  rowHead: { flexDirection: "row", alignItems: "center", gap: space.l },
  flex: { flex: 1 },
  rtl: { writingDirection: "rtl" },
  feet: { gap: space.m },
  feetCard: { borderWidth: 1, borderRadius: 12, paddingHorizontal: space.xl, paddingVertical: space.m },
});
