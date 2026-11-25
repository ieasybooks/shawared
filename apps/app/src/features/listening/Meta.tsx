import { space } from "@shawared/design";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconButton, type PressState, TogglePill } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { meterName, t } from "../../lib/i18n";
import { usePrefetch } from "../../lib/prefetch";
import { Only, responsive, useLayout } from "../../lib/responsive";
import { rhymeFor } from "../../lib/rhymes";
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

/** A labeled cell in the poem's classification strip. Some older bundles have an unindexed rhyme. */
function ClassificationCell({ label, value, to, divider }: { label: string; value: string; to?: string; divider: boolean }) {
  const { palette, start } = useSettings();
  const type = useType();
  const [hovered, setHovered] = useState(false);
  const prefetch = usePrefetch(to ?? "");
  const style = StyleSheet.flatten([
    styles.cell,
    divider && { borderStartWidth: 1, borderStartColor: palette.line },
    hovered && { backgroundColor: palette.fold },
  ]);
  const body = (
    <>
      <Text style={[type.classificationLabel, { color: palette.muted, textAlign: start }]}>{label}</Text>
      <Text style={[type.classificationValue, { color: palette.fg, textAlign: start }]}>{value}</Text>
    </>
  );
  if (!to) return <View style={style}>{body}</View>;
  return (
    <Link href={to} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}`}
        {...prefetch}
        onHoverIn={() => {
          prefetch.onHoverIn();
          setHovered(true);
        }}
        onHoverOut={() => {
          prefetch.onHoverOut();
          setHovered(false);
        }}
        style={style}
      >
        {body}
      </Pressable>
    </Link>
  );
}

/** The title and its actions, followed by the poem's theme, meter and rhyme. */
export function Meta() {
  const { bundle, recitation, hasTranslation, trOn, setTrOn, sources, hasAbout, showIntro, pinned } = useListening();
  const { palette, lang, href } = useSettings();
  const type = useType();
  const layout = useLayout();
  const { poem } = bundle;
  const primary = poem.themes?.[0];
  const rhyme = rhymeFor(poem.rawiy);
  const enTitle = lang === "en" ? sources.find((s) => s.title)?.title : undefined;
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
            <View style={styles.titleAbout}>
              <Text style={[type.poemTitle, styles.title, { color: palette.fg }]}>{poem.title}</Text>
              {hasAbout && (
                <IconButton
                  icon="info"
                  label={t(lang, "about")}
                  onPress={showIntro}
                  pressed={pinned === "intro"}
                  tip={{ title: t(lang, "about"), align: "end" }}
                  size={44}
                  iconSize={20}
                />
              )}
            </View>
            <View style={styles.actions}>
              <FavouriteButton kind="poems" id={poem.id} size={44} iconSize={20} />
              <PlaylistMenu poemId={poem.id} size={44} iconSize={20} />
              <DownloadButton
                poem={{
                  id: poem.id,
                  title: poem.title,
                  audio: recitation.audio,
                  langs: catalogNow()?.poems.find((p) => p.id === poem.id)?.langs ?? ["ar", "en"],
                }}
                size={44}
                iconSize={20}
              />
              {hasTranslation && <TogglePill label={t(lang, "translation")} on={trOn} onPress={() => setTrOn(!trOn)} />}
            </View>
          </View>
          {enTitle && <Text style={[type.subtitle, { color: palette.muted }]}>{enTitle}</Text>}
        </View>
      </View>
      <View style={[styles.strip, layout.style(sized.strip), { borderColor: palette.line, backgroundColor: palette.raise }]}>
        {primary && (
          <ClassificationCell label={t(lang, "poemTheme")} value={primary.name} to={href(paths.theme(primary.id))} divider={false} />
        )}
        <ClassificationCell
          label={t(lang, "poemMeter")}
          value={meterName(poem.meter, lang)}
          to={href(paths.meter(poem.meter))}
          divider={!!primary}
        />
        {poem.rawiy && (
          <ClassificationCell
            label={t(lang, "poemRhyme")}
            value={rhyme?.[lang] ?? poem.rawiy}
            {...(rhyme ? { to: href(paths.rhyme(rhyme.id)) } : {})}
            divider
          />
        )}
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
  // On wide windows the strip lines up with the title, past the play button.
  strip: responsive({ marginStart: 0, maxWidth: "100%" }, { marginStart: 92, maxWidth: 360 }),
};

const styles = StyleSheet.create({
  meta: { gap: space.l },
  head: { flexDirection: "row", alignItems: "center", gap: 20, zIndex: 1 },
  titles: { flex: 1, minWidth: 0, gap: space.s },
  by: { flexDirection: "row", alignItems: "center", gap: space.s },
  underline: { textDecorationLine: "underline" },
  big: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  hover: { opacity: 0.88 },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: space.m, rowGap: space.xxs },
  titleAbout: { flexDirection: "row", alignItems: "center", flexShrink: 1, maxWidth: "100%", gap: space.xxs, zIndex: 1 },
  title: { writingDirection: "rtl", flexShrink: 1 },
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginStart: "auto", maxWidth: "100%" },
  strip: { flexDirection: "row", borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: space.l,
    paddingVertical: space.xs,
    gap: space.xxs,
  },
  versesHint: { paddingStart: 40, paddingEnd: 40, paddingTop: space.xl, paddingBottom: space.xs },
});
