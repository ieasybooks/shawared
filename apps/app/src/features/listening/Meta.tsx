import { space } from "@shawared/design";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Chip, IconButton, type PressState, TogglePill } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { catalogNow } from "../../lib/content";
import { meterName, rhymeName, t } from "../../lib/i18n";
import { Only, responsive, useLayout } from "../../lib/responsive";
import { rhymeFor } from "../../lib/rhymes";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { PHONE_BAR_BUTTON_SIZE, PHONE_BAR_INSET } from "../navigation/TopBar";
import { DownloadButton } from "../saved/DownloadButton";
import { FavouriteButton, PlaylistMenu } from "../saved/SavedButtons";
import { usePlaying } from "./playback";
import { useListening } from "./state";

const ACTION_SIZE = 44;

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

/** The title and its actions, followed by the poem's theme, meter and rhyme. */
export function Meta() {
  const { bundle, recitation, hasTranslation, trOn, setTrOn, sources, hasAbout, showIntro, pinned } = useListening();
  const { palette, lang, href, start } = useSettings();
  const type = useType();
  const layout = useLayout();
  const { poem } = bundle;
  const primary = poem.themes?.[0];
  const meter = meterName(poem.meter, lang);
  const rhyme = rhymeFor(poem.rawiy);
  const enTitle = lang === "en" ? sources.find((s) => s.title)?.title : undefined;
  const translation = hasTranslation && <TogglePill label={t(lang, "translation")} on={trOn} onPress={() => setTrOn(!trOn)} />;
  return (
    <View style={layout.style(sized.meta)}>
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
            <Text style={[type.poemTitle, styles.title, layout.style(sized.title), { color: palette.fg, textAlign: start }]}>
              {poem.title}
            </Text>
            <View style={[styles.actions, layout.style(sized.actions)]}>
              {translation && <Only on="phone">{translation}</Only>}
              {hasAbout && (
                <IconButton
                  icon="info"
                  label={t(lang, "about")}
                  onPress={showIntro}
                  pressed={pinned === "intro"}
                  showPressedMark={false}
                  color={pinned === "intro" ? palette.fg : palette.muted}
                  tip={{ title: t(lang, "about"), align: "end" }}
                  size={ACTION_SIZE}
                  iconSize={20}
                />
              )}
              <FavouriteButton kind="poems" id={poem.id} size={ACTION_SIZE} iconSize={20} />
              <PlaylistMenu poemId={poem.id} size={ACTION_SIZE} iconSize={20} />
              <DownloadButton
                poem={{
                  id: poem.id,
                  title: poem.title,
                  audio: recitation.audio,
                  langs: catalogNow()?.poems.find((p) => p.id === poem.id)?.langs ?? ["ar", "en"],
                }}
                size={ACTION_SIZE}
                iconSize={20}
              />
              {translation && <Only on="wide">{translation}</Only>}
            </View>
          </View>
          {enTitle && <Text style={[type.subtitle, { color: palette.muted }]}>{enTitle}</Text>}
        </View>
      </View>
      <View style={[styles.badges, layout.style(sized.badges)]}>
        {primary && (
          <Chip lead="tag" href={href(paths.theme(primary.id))} label={`${t(lang, "poemTheme")}: ${primary.name}`}>
            {primary.name}
          </Chip>
        )}
        <Chip lead="waves" href={href(paths.meter(poem.meter))} label={`${t(lang, "poemMeter")}: ${meter}`}>
          {meter}
        </Chip>
        {poem.rawiy && (
          <Chip lead="rhymes" {...(rhyme ? { href: href(paths.rhyme(rhyme.id)), label: `${t(lang, "poemRhyme")}: ${rhyme[lang]}` } : {})}>
            {rhymeName(poem.rawiy, lang)}
          </Chip>
        )}
      </View>
    </View>
  );
}

const sized = {
  // The title lines up with Back's outside edge; the last action is centered under Appearance.
  meta: responsive(
    { paddingTop: space.l, paddingStart: PHONE_BAR_INSET, paddingEnd: PHONE_BAR_INSET - (ACTION_SIZE - PHONE_BAR_BUTTON_SIZE) / 2 },
    { paddingTop: space.xs, paddingStart: 40, paddingEnd: 40 },
  ),
  // Let the title wrap beside the actions while there is room for a few words.
  title: responsive({ flexBasis: 112, flexGrow: 1 }, { flexBasis: "auto" as const, flexGrow: 0 }),
  // Match the toolbar's 46px distance between button centres, with larger action targets.
  actions: responsive({ columnGap: space.xxs }, { columnGap: 0 }),
  // On wide windows the badges line up with the title, past the play button.
  badges: responsive({ marginStart: 0 }, { marginStart: 92 }),
};

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 20, zIndex: 1 },
  titles: { flex: 1, minWidth: 0, gap: space.s },
  by: { flexDirection: "row", alignItems: "center", gap: space.s },
  underline: { textDecorationLine: "underline" },
  big: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  hover: { opacity: 0.88 },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: space.m, rowGap: space.xxs },
  title: { writingDirection: "rtl", flexShrink: 1, minWidth: 0, maxWidth: "100%" },
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginStart: "auto", maxWidth: "100%" },
  badges: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: space.s },
});
