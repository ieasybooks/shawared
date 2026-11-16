import { space } from "@shawared/design";
import { segmentAt, type Track } from "@shawared/listening";
import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useStore } from "../../lib/store";
import { useType } from "../../lib/type";
import { player, type Clock } from "./player";

const selectNow = (s: { item: unknown; track: Track | null }) => s;
const selectPlaying = (s: Clock) => s.playing;

/**
 * What is playing: above the tabs, or at the bottom of a page opened from another. Tap it to
 * go back to the poem; play, pause or close it in place.
 */
export function MiniPlayer({ docked = false }: { docked?: boolean }) {
  const { item, track } = useStore(player.now, selectNow) as ReturnType<typeof player.now.get>;
  const playing = useStore(player.clock, selectPlaying);
  const selectBayt = useCallback((s: Clock) => (track ? (track.segments[segmentAt(track, s.time)]?.n ?? 1) : 1), [track]);
  const n = useStore(player.clock, selectBayt);
  const { palette, lang, href } = useSettings();
  const type = useType();
  const insets = useSafeAreaInsets();
  if (!item) return null;
  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: palette.raise, borderTopColor: palette.line },
        docked && { paddingBottom: insets.bottom + space.m },
      ]}
    >
      <Progress duration={item.recitation.duration} />
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={item.title}
        onPress={() => router.push(href(paths.poem(item.poemId)))}
        style={styles.info}
      >
        <Text numberOfLines={1} style={[type.miniTitle, styles.rtl, { color: palette.fg }]}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={[type.caption, { color: palette.muted }]}>
          {t(lang, "now", { n, N: item.abyat })} · {item.poet}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(lang, playing ? "pause" : "play")}
        onPress={() => player.toggle()}
        style={[styles.play, { backgroundColor: palette.fg }]}
      >
        <Icon name={playing ? "pause" : "play"} size={18} color={palette.bg} />
      </Pressable>
      <IconButton
        icon="close"
        label={t(lang, "closePlayer")}
        onPress={() => player.close()}
        size={36}
        iconSize={18}
        color={palette.muted}
      />
    </View>
  );
}

const selectTime = (s: Clock) => s.time;

/** A hairline along the top edge, filling with the recitation from the reading start. */
function Progress({ duration }: { duration: number }) {
  const time = useStore(player.clock, selectTime);
  const { palette } = useSettings();
  return (
    <View pointerEvents="none" style={[styles.track, { backgroundColor: palette.line }]}>
      <View style={[styles.fill, { backgroundColor: palette.accent, width: `${Math.min(1, time / duration) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingVertical: space.m,
    paddingStart: space.xl,
    paddingEnd: space.s,
    borderTopWidth: 1,
  },
  info: { flex: 1, minWidth: 0, gap: space.xs },
  rtl: { writingDirection: "rtl" },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  track: { position: "absolute", top: -1, start: 0, end: 0, height: 2 },
  fill: { position: "absolute", top: 0, bottom: 0, start: 0 },
});
