import { space } from "@shawared/design";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";

export function DirectoryIndexLink({ href, label }: { href: string; label: string }) {
  const { palette } = useSettings();
  const type = useType();
  return (
    <View style={styles.indexLink}>
      <TextLink href={href} style={styles.control}>
        <Text style={[type.labelStrong, { color: palette.muted }]}>{label}</Text>
        <Icon name="chevron" size={14} color={palette.muted} />
      </TextLink>
    </View>
  );
}

const styles = StyleSheet.create({
  indexLink: { marginStart: "auto" },
  control: { flexDirection: "row", alignItems: "center", gap: space.s, minHeight: 44 },
});
