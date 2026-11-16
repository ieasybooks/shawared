import { space } from "@shawared/design";
import { StyleSheet, Text, View } from "react-native";
import { Chip, IconButton, TogglePill } from "../../components/ui/controls";
import { TextLink } from "../../components/ui/TextLink";
import { abyatCount, meterName, rhymeName, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { useGoBack } from "../navigation/TopBar";
import { useListening } from "./state";

/** Title, translated title, meter, rhyme, count and the translation switch. */
export function Meta({ wide = false }: { wide?: boolean }) {
  const { bundle, hasTranslation, trOn, setTrOn, sources, intro, showIntro, pinned } = useListening();
  const { palette, lang, href } = useSettings();
  const type = useType();
  const goBack = useGoBack();
  const { poem } = bundle;
  const enTitle = lang === "en" ? sources.find((s) => s.title)?.title : undefined;
  const pill = hasTranslation ? <TogglePill label={t(lang, "translation")} on={trOn} onPress={() => setTrOn(!trOn)} /> : null;
  return (
    <View style={[styles.meta, wide && styles.metaWide]}>
      {wide && (
        <TextLink href={href(paths.poet(bundle.poet.id))}>
          <Text style={[type.label, { color: palette.muted }]}>
            {t(lang, "by")} {bundle.poet.name}
          </Text>
        </TextLink>
      )}
      <View style={[styles.titleRow, wide && styles.pullStart]}>
        {/* Phones have back in the top bar; wide windows put it beside the title, as on every page. */}
        {wide && <IconButton icon="back" label={t(lang, "back")} onPress={goBack} />}
        <Text style={[wide ? type.titleWide : type.title, styles.title, { color: palette.fg }]}>{poem.title}</Text>
        {!wide && <View style={styles.sp} />}
        {!wide && pill}
      </View>
      {enTitle && <Text style={[type.subtitle, { color: palette.muted }]}>{enTitle}</Text>}
      <View style={styles.chips}>
        <Chip>{meterName(poem.meter, lang)}</Chip>
        {poem.rawiy && <Chip>{rhymeName(poem.rawiy, lang)}</Chip>}
        <Chip ghost>{abyatCount(poem.abyat.length, lang)}</Chip>
        {intro && (
          <Chip onPress={showIntro} active={pinned === "intro"}>
            {t(lang, "about")}
          </Chip>
        )}
        {wide && <View style={styles.sp} />}
        {wide && pill}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: { paddingTop: space.xs, paddingHorizontal: 20, gap: space.m },
  metaWide: { paddingTop: space.xl, paddingHorizontal: 36 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  // The back arrow's glyph, not its round button, lines up with the text below.
  pullStart: { marginStart: -space.m },
  title: { writingDirection: "rtl", flexShrink: 1 },
  chips: { flexDirection: "row", gap: space.s, flexWrap: "wrap", alignItems: "center" },
  sp: { flex: 1 },
});
