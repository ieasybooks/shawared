import type { Catalog, CatalogPerson, CatalogPoem, UiLang } from "@shawared/contracts";
import { fonts, space } from "@shawared/design";
import { Link } from "expo-router";
import { usePrefetch } from "../../lib/prefetch";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Dir } from "../../components/ui/Dir";
import { Icon } from "../../components/ui/Icon";
import { Half } from "../../components/ui/Measure";
import { abyatCount, clock, meterName, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";

/** A person's name in the reader's language. */
export const nameOf = (p: CatalogPerson | undefined, lang: UiLang) => (p ? (lang === "ar" ? p.name : (p.names[lang] ?? p.name)) : "");

function facts(poem: CatalogPoem, lang: UiLang) {
  const rec = poem.recitations[0];
  return [meterName(poem.meter, lang), abyatCount(poem.abyat, lang), rec ? clock(rec.duration, lang) : null].filter(Boolean).join(" · ");
}

/** A poem on the home page: title, opening bayt, poet, reciter. */
export function PoemCard({ poem, catalog }: { poem: CatalogPoem; catalog: Catalog }) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const rec = poem.recitations[0];
  const reciter = rec ? catalog.reciters[rec.reciter] : undefined;
  const to = href(paths.poem(poem.id));
  const prefetch = usePrefetch(to);
  return (
    <Link href={to} asChild>
      <Pressable
        accessibilityRole="link"
        {...prefetch}
        style={StyleSheet.flatten([
          styles.card,
          { backgroundColor: palette.raise, borderColor: palette.line, shadowColor: palette.shadow },
        ])}
      >
        <View style={styles.top}>
          <View style={styles.titles}>
            <Text style={[type.cardTitle, styles.rtl, { color: palette.fg, textAlign: start }]}>{poem.title}</Text>
            {lang === "en" && poem.titles.en && <Text style={[type.subtitle, { color: palette.muted }]}>{poem.titles.en}</Text>}
          </View>
          <View style={[styles.play, { backgroundColor: palette.fg }]}>
            <Icon name="play" size={18} color={palette.bg} />
          </View>
        </View>
        <Dir dir="rtl" lang="ar" style={[styles.opening, { backgroundColor: palette.fold }]}>
          <Half
            text={poem.opening.sadr}
            kashida={poem.kashida[`${poem.opening.n}.1`]}
            measure={poem.measure}
            style={[type.verseSmall, { color: palette.partner }]}
            side="start"
            indent="12%"
          />
          <Half
            text={poem.opening.ajuz}
            kashida={poem.kashida[`${poem.opening.n}.2`]}
            measure={poem.measure}
            style={[type.verseSmall, { color: palette.partner }]}
            side="end"
            indent="12%"
          />
        </Dir>
        <View style={styles.byline}>
          <Text style={[type.controlStrong, { color: palette.fg, textAlign: start }]}>
            {nameOf(catalog.poets[poem.poet], lang)}
            {reciter ? (
              <Text style={{ color: palette.muted, fontFamily: fonts.ui }}>
                {" · "}
                {t(lang, "recitedBy", { name: nameOf(reciter, lang) })}
              </Text>
            ) : null}
          </Text>
          <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{facts(poem, lang)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

/** A poem in a list: its title, and who and how long. */
export function PoemRow({ poem, catalog, show }: { poem: CatalogPoem; catalog: Catalog; show: "poet" | "reciter" }) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const rec = poem.recitations[0];
  const who =
    show === "poet"
      ? nameOf(catalog.poets[poem.poet], lang)
      : rec
        ? t(lang, "recitedBy", { name: nameOf(catalog.reciters[rec.reciter], lang) })
        : "";
  const to = href(paths.poem(poem.id));
  const prefetch = usePrefetch(to);
  return (
    <Link href={to} asChild>
      <Pressable accessibilityRole="link" {...prefetch} style={StyleSheet.flatten([styles.row, { borderTopColor: palette.line }])}>
        <Text style={[type.listTitle, styles.rtl, { color: palette.fg, textAlign: start }]}>{poem.title}</Text>
        <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{[who, facts(poem, lang)].filter(Boolean).join(" · ")}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 3,
  },
  top: { flexDirection: "row", alignItems: "center", gap: space.l },
  titles: { flex: 1, gap: space.xs },
  rtl: { writingDirection: "rtl" },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  opening: { borderRadius: 12, paddingVertical: space.m, paddingHorizontal: 14 },
  byline: { gap: space.s },
  row: { borderTopWidth: 1, paddingVertical: 14, gap: space.s },
});
