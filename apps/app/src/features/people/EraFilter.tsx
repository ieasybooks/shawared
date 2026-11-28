import { ERAS, type Era } from "@shawared/contracts";
import { space } from "@shawared/design";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { directoryCount, t } from "../../lib/i18n";
import { Only } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { DirectoryCell, DirectoryGrid } from "../library/DirectoryGrid";

import type { EraGroup } from "./eras";

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
  const phoneCount = expanded ? groups.length : Math.min(4, groups.length);
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
      <DirectoryGrid phoneCount={phoneCount}>
        {groups.map(({ id, count }, i) => (
          <DirectoryCell
            key={id}
            index={i}
            name={ERAS[id][lang]}
            count={directoryCount("poets", count, lang)}
            hideOnPhone={i >= phoneCount}
            selected={selected === id}
            onPress={() => onChange(selected === id ? null : id)}
          />
        ))}
      </DirectoryGrid>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  group: { gap: space.s },
  heading: { flexDirection: "row", alignItems: "center", gap: space.m },
  action: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: space.s },
});
