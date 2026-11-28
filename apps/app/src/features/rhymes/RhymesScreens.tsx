import type { Catalog } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { StateView } from "../../components/ui/StateView";
import { useCatalog } from "../../lib/content";
import { poemsForRhyme } from "../../lib/catalog";
import { directoryCount, poemsCount, rhymeName, t } from "../../lib/i18n";
import { RHYMES, rhymeById, rhymeCounts, type Rhyme } from "../../lib/rhymes";
import { paths } from "../../lib/routes";
import { Only } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { DirectoryIndexLink } from "../library/DirectoryIndexLink";
import { SortBar } from "../library/SortBar";
import { listEdges, type ListEdges } from "../library/ListEdges";
import { DetailFacts, ListPage, PageFrame, SectionHead } from "../library/Page";
import { PoemRow } from "../library/PoemCard";

export function RhymesScreen({ initial }: { initial?: { counts: Record<string, number> } | undefined }) {
  const { data, error, retry } = useCatalog();
  const { lang } = useSettings();
  const [order, setOrder] = useState<"byRhymeLetter" | "byPoemCount">("byRhymeLetter");
  const counts = useMemo(() => (data ? rhymeCounts(data.poems) : initial?.counts), [data, initial]);
  const rhymes = useMemo(() => {
    const letters = RHYMES.filter((r) => counts?.[r.id]);
    // A stable sort leaves ties in Arabic letter order in both languages.
    return order === "byPoemCount" ? letters.sort((a, b) => counts![b.id]! - counts![a.id]!) : letters;
  }, [counts, order]);
  const title = t(lang, "rhymes");
  if (!counts)
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
      data={rhymes}
      keyOf={(r) => r.id}
      estimatedItemSize={81}
      empty={poemsCount(0, lang)}
      header={
        <SortBar
          count={directoryCount("rhymes", rhymes.length, lang)}
          label={t(lang, "sortRhymes")}
          value={order}
          options={["byRhymeLetter", "byPoemCount"]}
          onChange={setOrder}
        />
      }
      renderItem={(rhyme, i) => <RhymeRow rhyme={rhyme} count={counts[rhyme.id]!} first={i === 0} last={i === rhymes.length - 1} />}
    />
  );
}

function RhymeRow({ rhyme, count, first, last }: { rhyme: Rhyme; count: number } & ListEdges) {
  const { lang, href, palette, start } = useSettings();
  const type = useType();
  return (
    <Link href={href(paths.rhyme(rhyme.id))} asChild>
      <Pressable
        accessibilityRole="link"
        style={StyleSheet.flatten([styles.row, { borderTopColor: palette.line }, first && listEdges.first, last && listEdges.last])}
      >
        <View accessible={false} aria-hidden style={[styles.letter, { backgroundColor: palette.fold, borderColor: palette.line }]}>
          <Text style={[type.nameAr, { color: palette.fg }]}>{rhyme.letter}</Text>
        </View>
        <Text style={[lang === "ar" ? type.listTitle : type.heading, styles.grow, { color: palette.fg, textAlign: start }]}>
          {rhymeName(rhyme.letter, lang)}
        </Text>
        <Text style={[type.label, { color: palette.muted }]}>{poemsCount(count, lang)}</Text>
        <Icon name="chevron" size={15} color={palette.muted} />
      </Pressable>
    </Link>
  );
}

export function RhymeScreen({ id, initial }: { id: string; initial?: { catalog: Catalog } | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { lang, href } = useSettings();
  const rhyme = rhymeById(id);
  const poems = useMemo(() => (data ? poemsForRhyme(data.poems, id) : []), [data, id]);
  const list = useMemo(() => poems.map((p) => p.id), [poems]);
  if (!data || !rhyme || !poems.length)
    return (
      <PageFrame back title={t(lang, "rhymes")}>
        {data ? <StateView message={t(lang, "notFound")} /> : <StateView error={error} onRetry={retry} />}
      </PageFrame>
    );
  return (
    <ListPage
      back
      title={rhymeName(rhyme.letter, lang)}
      data={poems}
      keyOf={(p) => p.id}
      estimatedItemSize={86}
      header={
        <>
          {lang === "en" && <DetailFacts arabic={rhymeName(rhyme.letter, "ar")} />}
          <SectionHead
            title={t(lang, "poems")}
            count={poemsCount(poems.length, lang)}
            action={
              <Only on="phone">
                <DirectoryIndexLink href={href(paths.rhymes)} label={t(lang, "allRhymes")} />
              </Only>
            }
          />
        </>
      }
      renderItem={(poem, i) => <PoemRow poem={poem} catalog={data} show="poet" list={list} first={i === 0} last={i === poems.length - 1} />}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.l, borderTopWidth: 1, paddingVertical: space.l },
  grow: { flex: 1, minWidth: 0 },
  letter: { width: 48, height: 48, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
