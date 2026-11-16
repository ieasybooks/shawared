import type { Catalog } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StateView } from "../../components/ui/StateView";
import { useCatalog } from "../../lib/content";
import { METER_FEET, METER_IDS, meterName, poemsCount, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
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
      <PageFrame title={title}>
        <StateView error={error} onRetry={retry} />
      </PageFrame>
    );
  return (
    <ListPage
      title={title}
      data={METER_IDS}
      keyOf={(m) => m}
      renderItem={(m) => <MeterRow id={m} count={data.meters[m] ?? 0} />}
      estimatedItemSize={96}
    />
  );
}

function MeterRow({ id, count }: { id: string; count: number }) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  return (
    <Link href={href(paths.meter(id))} asChild>
      <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.row, { borderTopColor: palette.line }])}>
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
        <Text style={[type.verseSmall, styles.rtl, { color: palette.muted, textAlign: start }]}>{METER_FEET[id]}</Text>
      </Pressable>
    </Link>
  );
}

/** One meter: its feet, and the poems written in it. */
export function MeterScreen({ id, initial }: { id: string; initial?: { catalog: Catalog } | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { palette, lang, start } = useSettings();
  const type = useType();
  const poems = useMemo(() => data?.poems.filter((p) => p.meter === id) ?? [], [data, id]);
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
        <View style={styles.feet}>
          <Text style={[type.labelStrong, { color: palette.muted, textAlign: start }]}>{t(lang, "pattern")}</Text>
          <Text style={[type.verse, styles.rtl, { color: palette.fg, textAlign: start }]}>{METER_FEET[id]}</Text>
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
      renderItem={(p) => <PoemRow poem={p} catalog={data} show="poet" />}
      estimatedItemSize={86}
    />
  );
}

const styles = StyleSheet.create({
  row: { borderTopWidth: 1, paddingVertical: 14, gap: space.s },
  rowHead: { flexDirection: "row", alignItems: "center", gap: space.l },
  flex: { flex: 1 },
  rtl: { writingDirection: "rtl" },
  feet: { gap: space.s },
});
