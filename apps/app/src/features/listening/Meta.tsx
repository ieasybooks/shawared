import { space } from "@shawared/design";
import { StyleSheet, Text, View } from "react-native";
import { Chip, IconButton, TogglePill } from "../../components/ui/controls";
import { TextLink } from "../../components/ui/TextLink";
import { abyatCount, meterName, rhymeName, t } from "../../lib/i18n";
import { Only, responsive, useLayout } from "../../lib/responsive";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { catalogNow } from "../../lib/content";
import { useGoBack } from "../navigation/TopBar";
import { DownloadButton } from "../saved/DownloadButton";
import { FavouriteButton, PlaylistMenu } from "../saved/SavedButtons";
import { useListening } from "./state";

/**
 * Title, translated title, meter, rhyme, count and the translation switch, and what the reader
 * can keep: the heart, a playlist, a download (the apps). Wide windows add the poet above the
 * title and back beside it (phones have both in the top bar), and put the switch at the end of
 * the chips rather than of the title. The reader's buttons end the chips' line, or take the next
 * one where it is full.
 */
export function Meta() {
  const { bundle, recitation, hasTranslation, trOn, setTrOn, sources, intro, showIntro, pinned } = useListening();
  const { palette, lang, href } = useSettings();
  const type = useType();
  const layout = useLayout();
  const goBack = useGoBack();
  const { poem } = bundle;
  const enTitle = lang === "en" ? sources.find((s) => s.title)?.title : undefined;
  const pill = hasTranslation ? <TogglePill label={t(lang, "translation")} on={trOn} onPress={() => setTrOn(!trOn)} /> : null;
  return (
    <View style={[styles.meta, layout.style(sized.meta)]}>
      <Only on="wide">
        <TextLink href={href(paths.poet(bundle.poet.id))}>
          <Text style={[type.label, { color: palette.muted }]}>
            {t(lang, "by")} {bundle.poet.name}
          </Text>
        </TextLink>
      </Only>
      <View style={[styles.titleRow, layout.style(sized.titleRow)]}>
        {/* Phones have back in the top bar; wide windows put it beside the title, as on every page. */}
        <Only on="wide">
          <IconButton icon="back" label={t(lang, "back")} onPress={goBack} />
        </Only>
        <Text style={[type.poemTitle, styles.title, { color: palette.fg }]}>{poem.title}</Text>
        <Only on="phone">
          <View style={styles.sp} />
          {pill}
        </Only>
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
        <View style={styles.actions}>
          <FavouriteButton kind="poems" id={poem.id} size={36} iconSize={20} />
          <PlaylistMenu poemId={poem.id} size={36} iconSize={20} />
          <DownloadButton
            poem={{
              id: poem.id,
              title: poem.title,
              audio: recitation.audio,
              langs: catalogNow()?.poems.find((p) => p.id === poem.id)?.langs ?? ["ar", "en"],
            }}
            size={36}
            iconSize={20}
          />
          <Only on="wide">{pill}</Only>
        </View>
      </View>
    </View>
  );
}

const sized = {
  meta: responsive({ paddingTop: space.xs, paddingHorizontal: 20 }, { paddingTop: space.xl, paddingHorizontal: 36 }),
  // The back arrow's glyph, not its round button, lines up with the text below.
  titleRow: responsive({ marginStart: 0 }, { marginStart: -space.m }),
};

const styles = StyleSheet.create({
  meta: { gap: space.m },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { writingDirection: "rtl", flexShrink: 1 },
  chips: { flexDirection: "row", gap: space.s, flexWrap: "wrap", alignItems: "center" },
  sp: { flex: 1 },
  // The end of the chips' line, or of the next where it is full.
  actions: { flexDirection: "row", alignItems: "center", gap: space.xxs, marginStart: "auto" },
});
