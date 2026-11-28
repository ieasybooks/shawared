import type { Catalog } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StateView } from "../../components/ui/StateView";
import { useCatalog } from "../../lib/content";
import { poemsForMeter } from "../../lib/catalog";
import { DirectoryIndexLink } from "../library/DirectoryIndexLink";
import { SortBar } from "../library/SortBar";
import { listEdges, type ListEdges } from "../library/ListEdges";
import { Only } from "../../lib/responsive";
import { directoryCount, METER_FEET, METER_IDS, meterName, poemsCount, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { ARABIC } from "../../lib/align";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { DetailFacts, ListPage, PageFrame, SectionHead } from "../library/Page";
import { PoemRow } from "../library/PoemCard";

export function MetersScreen({ initial }: { initial?: { catalog: Catalog } | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { lang } = useSettings();
  const title = t(lang, "meters");
  const [order, setOrder] = useState<"byPoemCount" | "alphabetical">("byPoemCount");
  const meters = useMemo(() => {
    const counts = data?.meters ?? {};
    const collator = new Intl.Collator(lang, { sensitivity: "base" });
    return [...METER_IDS].sort(
      (a, b) =>
        (order === "byPoemCount" ? (counts[b] ?? 0) - (counts[a] ?? 0) : 0) || collator.compare(meterName(a, lang), meterName(b, lang)),
    );
  }, [data, lang, order]);
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
      headerGap={0}
      header={
        <SortBar
          count={directoryCount("meters", meters.length, lang)}
          label={t(lang, "sortMeters")}
          options={["byPoemCount", "alphabetical"]}
          value={order}
          onChange={setOrder}
        />
      }
      data={meters}
      keyOf={(m) => m}
      renderItem={(m, i) => <MeterRow id={m} count={data.meters[m] ?? 0} first={i === 0} last={i === meters.length - 1} />}
      estimatedItemSize={96}
    />
  );
}

function MeterRow({ id, count, first, last }: { id: string; count: number } & ListEdges) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  return (
    <Link href={href(paths.meter(id))} asChild>
      <Pressable
        accessibilityRole="link"
        style={StyleSheet.flatten([styles.row, { borderTopColor: palette.line }, first && listEdges.first, last && listEdges.last])}
      >
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

export function MeterScreen({ id, initial }: { id: string; initial?: { catalog: Catalog } | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const poems = useMemo(() => (data ? poemsForMeter(data.poems, id) : []), [data, id]);
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
        <View style={styles.feet}>
          <View style={styles.rowHead}>
            <Text style={[type.labelStrong, { color: palette.muted, textAlign: start }]}>{t(lang, "pattern")}</Text>
            <Only on="phone">
              <DirectoryIndexLink href={href(paths.meters)} label={t(lang, "allMeters")} />
            </Only>
          </View>
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
      renderItem={(p, i) => <PoemRow poem={p} catalog={data} show="poet" list={list} first={i === 0} last={i === poems.length - 1} />}
      estimatedItemSize={86}
    />
  );
}

const styles = StyleSheet.create({
  row: { borderTopWidth: 1, paddingVertical: space.xl, gap: space.m },
  rowHead: { flexDirection: "row", alignItems: "center", gap: space.l },
  flex: { flex: 1 },
  rtl: { writingDirection: "rtl" },
  feet: { gap: space.m },
  feetCard: { borderWidth: 1, borderRadius: 12, paddingHorizontal: space.xl, paddingVertical: space.m },
});
