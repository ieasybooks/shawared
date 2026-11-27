import type { CatalogPerson, PersonKind } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { nameOf } from "../../lib/catalog";
import { directoryCount, poemsCount, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { usePrefetch } from "../../lib/prefetch";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { listEdges, type ListEdges } from "../library/ListEdges";

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

const styles = StyleSheet.create({
  row: { borderTopWidth: 1, paddingVertical: space.xl, gap: space.s, minHeight: 44, justifyContent: "center" },
  name: { writingDirection: "auto" },
});
