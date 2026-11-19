import { space } from "@shawared/design";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Chip, type PressState, TogglePill } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { meterName, rhymeName, t } from "../../lib/i18n";
import { Only, responsive, useLayout } from "../../lib/responsive";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { catalogNow } from "../../lib/content";
import { DownloadButton } from "../saved/DownloadButton";
import { FavouriteButton, PlaylistMenu } from "../saved/SavedButtons";
import { usePlaying } from "./playback";
import { useListening } from "./state";

/** The big round play button beside the title, on wide windows. */
function BigPlay() {
  const { playback } = useListening();
  const { palette, lang } = useSettings();
  const playing = usePlaying(playback);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(lang, playing ? "pause" : "listen")}
      onPress={playback.toggle}
      style={(s: PressState) => [styles.big, { backgroundColor: palette.fg }, (s.hovered || s.pressed) && styles.hover]}
    >
      <Icon name={playing ? "pause" : "play"} size={30} color={palette.bg} />
    </Pressable>
  );
}

/**
 * The poem's head: on wide windows the big play button, the poet and the title; on phones the
 * title (the poet is in the top bar, the player below). Then the chips: meter, rhyme and the
 * introduction (the length, the reciter and the time are the player's), and what the reader can
 * keep: the heart, a playlist, a download (the apps), and in English the translation switch.
 */
export function Meta() {
  const { bundle, recitation, hasTranslation, trOn, setTrOn, sources, intro, showIntro, pinned } = useListening();
  const { palette, lang, href } = useSettings();
  const type = useType();
  const layout = useLayout();
  const { poem } = bundle;
  const enTitle = lang === "en" ? sources.find((s) => s.title)?.title : undefined;
  const pill = hasTranslation ? <TogglePill label={t(lang, "translation")} on={trOn} onPress={() => setTrOn(!trOn)} /> : null;
  return (
    <View style={[styles.meta, layout.style(sized.meta)]}>
      <View style={styles.head}>
        <Only on="wide">
          <BigPlay />
        </Only>
        <View style={styles.titles}>
          <Only on="wide">
            <View style={styles.by}>
              <Text style={[type.label, { color: palette.muted }]}>{t(lang, "by")}</Text>
              <TextLink href={href(paths.poet(bundle.poet.id))}>
                <Text style={[type.labelStrong, styles.underline, { color: palette.muted, textDecorationColor: palette.line2 }]}>
                  {bundle.poet.name}
                </Text>
              </TextLink>
            </View>
          </Only>
          <View style={styles.titleRow}>
            <Text style={[type.poemTitle, styles.title, { color: palette.fg }]}>{poem.title}</Text>
            <Only on="phone">
              <View style={styles.sp} />
              {pill}
            </Only>
          </View>
          {enTitle && <Text style={[type.subtitle, { color: palette.muted }]}>{enTitle}</Text>}
        </View>
      </View>
      <View style={[styles.chips, layout.style(sized.chips)]}>
        <Chip>{meterName(poem.meter, lang)}</Chip>
        {poem.rawiy && <Chip>{rhymeName(poem.rawiy, lang)}</Chip>}
        {intro && (
          <Chip lead="notes" accent onPress={showIntro} active={pinned === "intro"}>
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

/** Above the verses on wide windows: how to use them. Phones have the sheet, which shows itself. */
export function VersesHint() {
  const { palette, lang, start } = useSettings();
  const type = useType();
  return (
    <View style={styles.versesHint}>
      <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{t(lang, "versesHint")}</Text>
    </View>
  );
}

const sized = {
  meta: responsive({ paddingTop: space.xs, paddingStart: 20, paddingEnd: 20 }, { paddingTop: space.xs, paddingStart: 40, paddingEnd: 40 }),
  // On wide windows the chips line up with the title, past the play button.
  chips: responsive({ marginStart: 0 }, { marginStart: 92 }),
};

const styles = StyleSheet.create({
  meta: { gap: space.l },
  head: { flexDirection: "row", alignItems: "center", gap: 20 },
  titles: { flex: 1, minWidth: 0, gap: space.s },
  by: { flexDirection: "row", alignItems: "center", gap: space.s },
  underline: { textDecorationLine: "underline" },
  big: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  hover: { opacity: 0.88 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { writingDirection: "rtl", flexShrink: 1 },
  chips: { flexDirection: "row", gap: space.s, flexWrap: "wrap", alignItems: "center" },
  sp: { flex: 1 },
  // The end of the chips' line, or of the next where it is full.
  actions: { flexDirection: "row", alignItems: "center", gap: space.xxs, marginStart: "auto" },
  versesHint: { paddingStart: 40, paddingEnd: 40, paddingTop: space.xl, paddingBottom: space.xs },
});
