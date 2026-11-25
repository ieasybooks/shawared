import { ERAS, type Catalog, type CatalogPerson, type Era, type PersonBundle, type PersonKind } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Chip } from "../../components/ui/controls";
import { CoverTile } from "../../components/ui/Girih";
import { StateView } from "../../components/ui/StateView";
import { useCatalog, usePerson } from "../../lib/content";
import { usePrefetch } from "../../lib/prefetch";
import { recordingsByReciter } from "../../lib/counts";
import { SortBar } from "../library/DirectoryControls";
import { listEdges, type ListEdges } from "../library/ListEdges";
import { EraFilter, eraOf, groupPoetsByEra } from "./EraFilter";
import { directoryCount, poemsCount, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { searchPeople } from "../../lib/search";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { DetailFacts, ListPage, PageFrame, SectionHead } from "../library/Page";
import { nameOf, PoemRow } from "../library/PoemCard";
import { SearchField } from "../library/SearchField";
import { FavouriteChip } from "../saved/SavedButtons";

type PeopleOrder = "alphabetical" | "byPoemCount" | "byRecordingCount";

export function PeopleScreen({
  kind,
  initial,
}: {
  kind: PersonKind;
  initial?: { catalog: Catalog; recordings?: Record<string, number> } | undefined;
}) {
  const { data: live, error, retry } = useCatalog();
  const data = live ?? initial?.catalog;
  const { lang } = useSettings();
  const [query, setQuery] = useState("");
  const [era, setEra] = useState<Era | null>(null);
  const [order, setOrder] = useState<PeopleOrder>("alphabetical");
  const groups = useMemo(() => (kind === "poets" && data ? groupPoetsByEra(data.poets) : []), [data, kind]);
  const activeEra = groups.some((group) => group.id === era) ? era : null;
  const recordings = useMemo(
    () => (kind === "reciters" && live ? recordingsByReciter(live.poems) : initial?.recordings),
    [kind, live, initial],
  );
  const people = useMemo(() => {
    if (!data) return [];
    const all = Object.values(data[kind]);
    const filtered = searchPeople(activeEra ? all.filter((p) => eraOf(p) === activeEra) : all, query);
    const collator = new Intl.Collator(lang, { sensitivity: "base" });
    return filtered.sort((a, b) => {
      if (order === "byPoemCount" && a.poems !== b.poems) return b.poems - a.poems;
      if (order === "byRecordingCount") {
        const difference = (recordings?.[b.id] ?? 0) - (recordings?.[a.id] ?? 0);
        if (difference) return difference;
      }
      return collator.compare(nameOf(a, lang), nameOf(b, lang)) || a.id.localeCompare(b.id);
    });
  }, [data, kind, lang, query, activeEra, order, recordings]);
  const title = t(lang, kind);
  if (!data)
    return (
      <PageFrame title={title}>
        <StateView error={error} onRetry={retry} />
      </PageFrame>
    );
  return (
    <ListPage
      title={title}
      headerGap={0}
      header={
        <>
          {kind === "poets" && <EraFilter groups={groups} selected={activeEra} onChange={setEra} />}
          <SearchField value={query} onChange={setQuery} placeholder={t(lang, kind === "poets" ? "searchPoets" : "searchReciters")} />
          <SortBar
            count={directoryCount(kind, people.length, lang)}
            filter={activeEra ? { label: ERAS[activeEra][lang], onClear: () => setEra(null) } : undefined}
            label={t(lang, kind === "poets" ? "sortPoets" : "sortReciters")}
            options={kind === "poets" ? ["alphabetical", "byPoemCount"] : ["alphabetical", "byRecordingCount"]}
            value={order}
            onChange={setOrder}
          />
        </>
      }
      data={people}
      keyOf={(p) => p.id}
      renderItem={(person, i) => (
        <PersonRow
          kind={kind}
          person={person}
          first={i === 0}
          last={i === people.length - 1}
          recordings={kind === "reciters" ? (recordings?.[person.id] ?? 0) : undefined}
        />
      )}
      estimatedItemSize={72}
      empty={t(lang, "noResults")}
    />
  );
}

/** A poet or a reciter in a list: the name, how many poems, and when they died. The `first` has no rule above it. */
export function PersonRow({
  kind,
  person,
  first,
  last,
  recordings,
}: {
  kind: PersonKind;
  person: CatalogPerson;
  recordings?: number | undefined;
} & ListEdges) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const count = recordings === undefined ? poemsCount(person.poems, lang) : directoryCount("recordings", recordings, lang);
  const facts = [count, person.died ? t(lang, "died", { h: person.died.hijri, c: person.died.ce }) : null].filter(Boolean).join(" · ");
  const to = href(kind === "poets" ? paths.poet(person.id) : paths.reciter(person.id));
  const prefetch = usePrefetch(to);
  return (
    <Link href={to} asChild>
      <Pressable
        accessibilityRole="link"
        {...prefetch}
        style={StyleSheet.flatten([styles.row, { borderTopColor: palette.line }, first && listEdges.first, last && listEdges.last])}
      >
        <Text style={[lang === "ar" ? type.nameAr : type.heading, styles.name, { color: palette.fg, textAlign: start }]}>
          {nameOf(person, lang)}
        </Text>
        <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{facts}</Text>
      </Pressable>
    </Link>
  );
}

/** A poet's or a reciter's page: who they are, and their poems. */
export function PersonScreen({
  kind,
  id,
  initial,
}: {
  kind: PersonKind;
  id: string;
  initial?: { catalog: Catalog; person: PersonBundle } | undefined;
}) {
  const catalog = useCatalog(initial?.catalog);
  const { palette, lang, start } = useSettings();
  const person = usePerson(kind, id, lang, initial?.person);
  const type = useType();
  const poems = useMemo(() => {
    if (!catalog.data || !person.data) return [];
    const ids = new Set(person.data.poems);
    return catalog.data.poems.filter((p) => ids.has(p.id));
  }, [catalog.data, person.data]);
  const list = useMemo(() => poems.map((p) => p.id), [poems]);
  if (!catalog.data || !person.data)
    return (
      <PageFrame back>
        <StateView error={catalog.error ?? person.error} onRetry={catalog.data ? person.retry : catalog.retry} />
      </PageFrame>
    );
  const p = person.data.person;
  const name = lang === "ar" ? p.name : (p.names[lang] ?? p.name);
  // The name in Arabic in full: under an English name, or when it says more than the short one.
  const arabic = lang === "ar" ? (p.full_name && p.full_name !== p.name ? p.full_name : null) : (p.full_name ?? p.name);
  const youtube = p.links?.youtube;

  const header = (
    <>
      <View style={styles.who}>
        <CoverTile size={104} name={p.name} radius={14} />
        <View style={styles.whoText}>
          <DetailFacts arabic={arabic}>
            {p.died && (
              <Text style={[type.body, { color: palette.muted, textAlign: start }]}>
                {t(lang, "died", { h: p.died.hijri, c: p.died.ce })}
              </Text>
            )}
          </DetailFacts>
          <View style={styles.links}>
            <FavouriteChip kind={kind} id={id} />
            {youtube && (
              <Chip icon="link" onPress={() => Linking.openURL(youtube)}>
                {t(lang, "youtube")}
              </Chip>
            )}
          </View>
        </View>
      </View>
      {p.bio && <Text style={[type.proseLarge, { color: palette.fg, textAlign: start }]}>{p.bio}</Text>}
      <SectionHead title={t(lang, "poems")} count={poemsCount(poems.length, lang)} />
    </>
  );
  return (
    <ListPage
      back
      title={name}
      header={header}
      data={poems}
      keyOf={(x) => x.id}
      renderItem={(x, i) => (
        <PoemRow
          poem={x}
          catalog={catalog.data!}
          show={kind === "poets" ? "reciter" : "poet"}
          list={list}
          first={i === 0}
          last={i === poems.length - 1}
        />
      )}
      estimatedItemSize={86}
    />
  );
}

const styles = StyleSheet.create({
  row: { borderTopWidth: 1, paddingVertical: space.xl, gap: space.s, minHeight: 44, justifyContent: "center" },
  name: { writingDirection: "auto" },
  links: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  who: { flexDirection: "row", alignItems: "center", gap: space.xl },
  whoText: { flex: 1, minWidth: 0, gap: space.l },
});
