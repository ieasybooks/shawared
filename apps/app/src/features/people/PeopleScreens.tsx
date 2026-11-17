import type { Catalog, CatalogPerson, PersonBundle, PersonKind } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Chip } from "../../components/ui/controls";
import { StateView } from "../../components/ui/StateView";
import { useCatalog, usePerson } from "../../lib/content";
import { usePrefetch } from "../../lib/prefetch";
import { poemsCount, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { searchPeople } from "../../lib/search";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { DetailFacts, ListPage, PageFrame, SectionHead } from "../library/Page";
import { nameOf, PoemRow } from "../library/PoemCard";
import { SearchField } from "../library/SearchField";

/** Every poet, or every reciter, with how many poems they have, and a search by name. */
export function PeopleScreen({ kind, initial }: { kind: PersonKind; initial?: { catalog: Catalog } | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { lang } = useSettings();
  const [query, setQuery] = useState("");
  const sorted = useMemo(() => {
    if (!data) return [];
    const all = Object.values(kind === "poets" ? data.poets : data.reciters);
    return all.sort((a, b) => b.poems - a.poems || nameOf(a, lang).localeCompare(nameOf(b, lang), lang));
  }, [data, kind, lang]);
  const people = useMemo(() => searchPeople(sorted, query), [sorted, query]);
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
      header={
        <View style={styles.search}>
          <SearchField value={query} onChange={setQuery} placeholder={t(lang, kind === "poets" ? "searchPoets" : "searchReciters")} />
        </View>
      }
      data={people}
      keyOf={(p) => p.id}
      renderItem={(person) => <PersonRow kind={kind} person={person} />}
      estimatedItemSize={72}
      empty={t(lang, "noResults")}
    />
  );
}

function PersonRow({ kind, person }: { kind: PersonKind; person: CatalogPerson }) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const facts = [poemsCount(person.poems, lang), person.died ? t(lang, "died", { h: person.died.hijri, c: person.died.ce }) : null]
    .filter(Boolean)
    .join(" · ");
  const to = href(kind === "poets" ? paths.poet(person.id) : paths.reciter(person.id));
  const prefetch = usePrefetch(to);
  return (
    <Link href={to} asChild>
      <Pressable accessibilityRole="link" {...prefetch} style={StyleSheet.flatten([styles.row, { borderTopColor: palette.line }])}>
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
      <DetailFacts arabic={arabic}>
        {p.died && (
          <Text style={[type.body, { color: palette.muted, textAlign: start }]}>{t(lang, "died", { h: p.died.hijri, c: p.died.ce })}</Text>
        )}
      </DetailFacts>
      {p.bio && <Text style={[type.proseLarge, { color: palette.fg, textAlign: start }]}>{p.bio}</Text>}
      {youtube && (
        <View style={styles.links}>
          <Chip icon="link" onPress={() => Linking.openURL(youtube)}>
            {t(lang, "youtube")}
          </Chip>
        </View>
      )}
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
      renderItem={(x) => <PoemRow poem={x} catalog={catalog.data!} show={kind === "poets" ? "reciter" : "poet"} />}
      estimatedItemSize={86}
    />
  );
}

const styles = StyleSheet.create({
  search: { maxWidth: 620, width: "100%" },
  row: { borderTopWidth: 1, paddingVertical: 14, gap: space.s },
  name: { writingDirection: "auto" },
  links: { flexDirection: "row", gap: space.s },
});
