import { ERA_IDS, ERAS, type CatalogPerson, type Era } from "@shawared/contracts";
import { space } from "@shawared/design";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { directoryCount, t } from "../../lib/i18n";
import { Only } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { DirectoryCell, DirectoryGrid } from "../library/DirectoryControls";

export function eraOf(person: CatalogPerson): Era {
  return person.era && Object.hasOwn(ERAS, person.era) ? (person.era as Era) : "uncertain";
}

type EraGroup = { id: Era; count: number };

export function groupPoetsByEra(poets: Record<string, CatalogPerson>): EraGroup[] {
  const people = Object.values(poets);
  if (!people.some((p) => p.era)) return []; // Catalogues published before era filtering.
  const counts = new Map<Era, number>();
  for (const poet of people) {
    const era = eraOf(poet);
    counts.set(era, (counts.get(era) ?? 0) + 1);
  }
  return ERA_IDS.filter((id) => counts.has(id)).map((id) => ({ id, count: counts.get(id)! }));
}

export function EraFilter({
  groups,
  selected,
  onChange,
}: {
  groups: EraGroup[];
  selected: Era | null;
  onChange: (era: Era | null) => void;
}) {
  const { lang, palette, start } = useSettings();
  const type = useType();
  const [expanded, setExpanded] = useState(false);
  if (!groups.length) return null;
  return (
    <View style={styles.group}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={[type.heading, styles.grow, { color: palette.fg, textAlign: start }]}>
          {t(lang, "eras")}
        </Text>
        {groups.length > 4 && (
          <Only on="phone">
            <Pressable
              accessibilityRole="button"
              aria-expanded={expanded}
              accessibilityState={{ expanded }}
              onPress={() => setExpanded(!expanded)}
              style={styles.action}
            >
              <Text style={[type.labelStrong, { color: palette.muted }]}>{t(lang, expanded ? "fewerEras" : "showEras")}</Text>
              <Icon name={expanded ? "up" : "down"} size={14} color={palette.muted} />
            </Pressable>
          </Only>
        )}
      </View>
      <DirectoryGrid>
        {groups.map(({ id, count }, i) => (
          <DirectoryCell
            key={id}
            index={i}
            name={ERAS[id][lang]}
            count={directoryCount("poets", count, lang)}
            hideOnPhone={!expanded && i >= 4}
            selected={selected === id}
            onPress={() => onChange(selected === id ? null : id)}
          />
        ))}
      </DirectoryGrid>
      {selected && (
        <View style={styles.selection}>
          <Text style={[type.controlStrong, styles.grow, { color: palette.fg, textAlign: start }]}>{ERAS[selected][lang]}</Text>
          <Pressable accessibilityRole="button" onPress={() => onChange(null)} style={styles.action}>
            <Text style={[type.labelStrong, { color: palette.muted }]}>{t(lang, "clearEra")}</Text>
            <Icon name="close" size={13} color={palette.muted} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  group: { gap: space.s },
  heading: { flexDirection: "row", alignItems: "center", gap: space.m },
  selection: { flexDirection: "row", alignItems: "center", gap: space.m },
  action: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: space.s },
});
