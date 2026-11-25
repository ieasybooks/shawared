import { themeOf, type Catalog, type CatalogTheme } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Dir } from "../../components/ui/Dir";
import { Icon } from "../../components/ui/Icon";
import { Half } from "../../components/ui/Measure";
import { StateView } from "../../components/ui/StateView";
import { useCatalog } from "../../lib/content";
import { poemsCount, themesCount, t } from "../../lib/i18n";
import { responsive, useLayout } from "../../lib/responsive";
import { paths } from "../../lib/routes";
import { fold } from "../../lib/search";
import { useSettings } from "../../lib/settings";
import { typeFor, useType } from "../../lib/type";
import { ListPage, PageFrame } from "../library/Page";
import { nameOf, PoemRow, useOpenPoem } from "../library/PoemCard";
import { SearchField } from "../library/SearchField";

type Preview = { catalog: Catalog };
const ORDERS = ["byPoemCount", "alphabetical"] as const;
type Order = (typeof ORDERS)[number];

export function ThemesScreen({ initial }: { initial?: Preview | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { lang, palette, start } = useSettings();
  const type = useType();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order>("byPoemCount");
  const [choosing, setChoosing] = useState(false);
  const title = t(lang, "themes");
  const groups = useMemo(() => {
    const words = fold(query).split(" ").filter(Boolean);
    return Object.entries(data?.themes ?? {})
      .filter(([, theme]) => {
        const names = fold(`${theme.name.ar} ${theme.name.en}`);
        return words.every((w) => names.includes(w));
      })
      .sort(([, a], [, b]) => (order === "byPoemCount" ? b.poems - a.poems : 0) || a.name[lang].localeCompare(b.name[lang], lang));
  }, [data?.themes, lang, order, query]);
  if (!data || !data.themes)
    return (
      <PageFrame title={title}>
        {data ? <StateView message={t(lang, "noThemes")} /> : <StateView error={error} onRetry={retry} />}
      </PageFrame>
    );
  const header = (
    <>
      <SearchField value={query} onChange={setQuery} placeholder={t(lang, "searchThemes")} />
      <View style={styles.bar}>
        <Text accessibilityLiveRegion="polite" style={[type.controlStrong, styles.grow, { color: palette.fg, textAlign: start }]}>
          {themesCount(groups.length, lang)}
        </Text>
        <Pressable accessibilityRole="button" aria-expanded={choosing} onPress={() => setChoosing(!choosing)} style={styles.sort}>
          <Text style={[type.label, { color: palette.muted }]}>{t(lang, order)}</Text>
          <Icon name={choosing ? "up" : "down"} size={14} color={palette.muted} />
        </Pressable>
      </View>
      {choosing && (
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t(lang, "sortThemes")}
          style={[styles.choices, { backgroundColor: palette.raise, borderColor: palette.line }]}
        >
          {ORDERS.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="radio"
              aria-checked={order === option}
              onPress={() => {
                setOrder(option);
                setChoosing(false);
              }}
              style={styles.option}
            >
              <Text style={[type.control, styles.grow, { color: palette.fg, textAlign: start }]}>{t(lang, option)}</Text>
              {order === option && <Icon name="check" size={16} color={palette.accent} />}
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
  return (
    <ListPage
      title={title}
      header={header}
      data={groups.length ? [groups] : []}
      keyOf={() => "grid"}
      renderItem={(items) => <ThemeGrid groups={items} />}
      empty={t(lang, "noResults")}
    />
  );
}

function ThemeGrid({ groups }: { groups: [string, CatalogTheme][] }) {
  const { lang, palette, start, href } = useSettings();
  const type = useType();
  const layout = useLayout();
  return (
    <View style={[styles.grid, { backgroundColor: palette.raise, borderColor: palette.line }]}>
      {groups.map(([id, theme], i) => (
        <Link key={id} href={href(paths.theme(id))} asChild>
          <Pressable
            accessibilityRole="link"
            style={StyleSheet.flatten([
              styles.cell,
              layout.style(cellSize),
              {
                borderColor: palette.line,
                borderStartWidth: layout.value(i % 2 ? 1 : 0, i % 3 ? 1 : 0),
                borderTopWidth: layout.value(i >= 2 ? 1 : 0, i >= 3 ? 1 : 0),
              },
            ])}
          >
            <View style={[styles.grow, styles.cellText]}>
              <Text style={[lang === "ar" ? type.nameAr : layout.style(englishCellTitle), { color: palette.fg, textAlign: start }]}>
                {theme.name[lang]}
              </Text>
              <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{poemsCount(theme.poems, lang)}</Text>
            </View>
            <Icon name="chevron" size={15} color={palette.muted} />
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

export function ThemeScreen({ id, initial }: { id: string; initial?: Preview | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { lang, palette, start } = useSettings();
  const type = useType();
  const theme = themeOf(data, id);
  const poems = useMemo(() => data?.poems.filter((p) => p.theme === id) ?? [], [data, id]);
  const list = useMemo(() => poems.map((p) => p.id), [poems]);
  if (!data || !theme)
    return (
      <PageFrame back title={t(lang, "themes")}>
        {data ? <StateView message={t(lang, data.themes ? "notFound" : "noThemes")} /> : <StateView error={error} onRetry={retry} />}
      </PageFrame>
    );
  const name = theme.name[lang];
  const samplePoem = poems.find((p) => p.id === theme.example.poem);
  const header = (
    <>
      <Text style={[type.proseLarge, { color: palette.muted, textAlign: start }]}>{theme.definition[lang]}</Text>
      {samplePoem && <Example example={theme.example} poet={nameOf(data.poets[samplePoem.poet], lang)} list={list} />}
      <View style={styles.bar}>
        <Text accessibilityRole="header" style={[type.heading, styles.grow, { color: palette.fg, textAlign: start }]}>
          {t(lang, "themePoems", { name })}
        </Text>
        <Text style={[type.label, { color: palette.muted }]}>{poemsCount(poems.length, lang)}</Text>
      </View>
    </>
  );
  return (
    <ListPage
      back
      title={name}
      header={header}
      data={poems}
      keyOf={(p) => p.id}
      renderItem={(p) => <PoemRow poem={p} catalog={data} show="poet" list={list} disclosure />}
      estimatedItemSize={86}
    />
  );
}

function Example({ example, poet, list }: { example: CatalogTheme["example"]; poet: string; list: string[] }) {
  const { lang, palette, href } = useSettings();
  const type = useType();
  const { poem, bayt, measure, kashida } = example;
  const to = href(paths.poem(poem, bayt.n));
  const open = useOpenPoem(to, poem, list);
  const credit = `${poet} · ${t(lang, "verse", { n: bayt.n })}`;
  return (
    <Link href={to} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${bayt.sadr}، ${bayt.ajuz} — ${credit}`}
        {...open}
        style={StyleSheet.flatten([styles.example, { backgroundColor: palette.fold, borderColor: palette.line }])}
      >
        <Dir dir="rtl" lang="ar">
          <Half
            text={bayt.sadr}
            kashida={kashida[`${bayt.n}.1`]}
            measure={measure}
            style={[type.verse, { color: palette.fg }]}
            side="start"
            indent="8%"
          />
          <Half
            text={bayt.ajuz}
            kashida={kashida[`${bayt.n}.2`]}
            measure={measure}
            style={[type.verse, { color: palette.fg }]}
            side="end"
            indent="8%"
          />
        </Dir>
        <View style={styles.credit}>
          <View style={[styles.rule, { backgroundColor: palette.line2 }]} />
          <Text style={[type.caption, { color: palette.muted }]}>{credit}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const englishCellTitle = responsive(typeFor("en").controlStrong, typeFor("en").heading);
const cellSize = responsive(
  { width: "50%" as const, minHeight: 78, paddingHorizontal: space.l },
  { width: "33.3333%" as const, minHeight: 88, paddingHorizontal: space.xl },
);
const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  bar: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 40 },
  sort: { flexDirection: "row", alignItems: "center", gap: space.s, minHeight: 44 },
  choices: { alignSelf: "flex-end", borderWidth: 1, borderRadius: 12, paddingHorizontal: space.l },
  option: { flexDirection: "row", alignItems: "center", minHeight: 44, gap: space.xl },
  grid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  cell: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingVertical: space.m },
  cellText: { gap: space.xs },
  example: { padding: space.xl, borderWidth: 1, borderRadius: 12, gap: space.m },
  credit: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: space.m },
  rule: { width: 16, height: 1 },
});
