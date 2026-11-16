import { fonts } from "@shawared/design";
import { nextTarget, previousTarget } from "@shawared/listening";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { IconButton } from "../../components/ui/controls";
import { Icon, Logo } from "../../components/ui/Icon";
import { clock, t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { usePlaying, useTime } from "./playback";
import { useCurrentBayt, useListening } from "./state";

/** The seek bar. Fills from the right in Arabic, from the left in English. */
export function Progress() {
  const { playback, recitation, jump } = useListening();
  const { palette, rtl, lang } = useSettings();
  const time = useTime(playback);
  const width = useRef(0);
  const [drag, setDrag] = useState<number | null>(null);
  const total = recitation.duration;
  const pct = Math.min(1, (drag ?? time) / total);

  const at = (e: GestureResponderEvent) => {
    const x = Math.max(0, Math.min(width.current, e.nativeEvent.locationX));
    const f = width.current ? x / width.current : 0;
    return (rtl ? 1 - f : f) * total;
  };
  const side = rtl ? "right" : "left";
  return (
    <View
      role="slider"
      aria-label={t(lang, "seek")}
      aria-valuemin={0}
      aria-valuemax={Math.round(total)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${clock(time, lang)} / ${clock(total, lang)}`}
      onLayout={(e) => (width.current = e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => setDrag(at(e))}
      onResponderMove={(e) => setDrag(at(e))}
      onResponderRelease={(e) => {
        jump(at(e));
        setDrag(null);
      }}
      onResponderTerminate={() => setDrag(null)}
      style={styles.bar}
    >
      <View pointerEvents="none" style={[styles.track, { backgroundColor: palette.line }]} />
      <View pointerEvents="none" style={[styles.fill, { backgroundColor: palette.accent, width: `${pct * 100}%`, [side]: 0 }]} />
      <View
        pointerEvents="none"
        style={[styles.head, { backgroundColor: palette.accent, [side]: `${pct * 100}%`, [rtl ? "marginRight" : "marginLeft"]: -6 }]}
      />
    </View>
  );
}

function Times() {
  const { playback, recitation } = useListening();
  const { palette, lang } = useSettings();
  const time = useTime(playback);
  const style = [styles.time, { color: palette.muted, fontFamily: fonts.ui }];
  return (
    <>
      <Text style={style}>{clock(time, lang)}</Text>
      <Text style={style}>{clock(recitation.duration, lang)}</Text>
    </>
  );
}

function Controls({ wide }: { wide?: boolean }) {
  const { playback, repeat, setRepeat, jump } = useListening();
  const { palette, lang, rtl } = useSettings();
  const playing = usePlaying(playback);
  const size = wide ? 38 : 42;
  const iconSize = wide ? 20 : 22;
  const playSize = wide ? 42 : 60;
  return (
    <View style={[styles.ctrls, wide && styles.ctrlsWide]}>
      <IconButton
        icon="repeat"
        label={t(lang, "repeat")}
        pressed={repeat}
        onPress={() => setRepeat(!repeat)}
        size={size}
        iconSize={iconSize}
        color={repeat ? palette.accent : palette.muted}
      />
      <IconButton
        icon="prev"
        label={t(lang, "prev")}
        onPress={() => jump(previousTarget(playback.track, playback.clock.get().time))}
        size={size}
        iconSize={iconSize}
        color={palette.fg}
        flip={!rtl}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(lang, playing ? "pause" : "play")}
        onPress={playback.toggle}
        style={[styles.play, { width: playSize, height: playSize, borderRadius: playSize / 2, backgroundColor: palette.fg }]}
      >
        <Icon name={playing ? "pause" : "play"} size={wide ? 18 : 24} color={palette.bg} />
      </Pressable>
      <IconButton
        icon="next"
        label={t(lang, "next")}
        onPress={() => {
          const to = nextTarget(playback.track, playback.clock.get().time);
          if (to !== null) jump(to);
        }}
        size={size}
        iconSize={iconSize}
        color={palette.fg}
        flip={!rtl}
      />
      <View style={{ width: size, height: size }} />
    </View>
  );
}

function NowLabel() {
  const { abyat } = useListening();
  const { lang } = useSettings();
  const n = useCurrentBayt();
  return <>{t(lang, "now", { n, N: abyat.length })}</>;
}

export function PhonePlayer() {
  const { bundle, recitation } = useListening();
  const { palette, lang } = useSettings();
  const reciter = bundle.reciters[recitation.reciter]?.name ?? recitation.reciter;
  return (
    <View style={[styles.phone, { borderTopColor: palette.line, backgroundColor: palette.bg }]}>
      <View style={styles.now}>
        <Text style={[styles.small, { color: palette.muted, fontFamily: fonts.ui }]}>
          <NowLabel />
        </Text>
        <Text numberOfLines={1} style={[styles.small, styles.shrink, { color: palette.muted, fontFamily: fonts.ui }]}>
          {t(lang, "recitedBy", { name: reciter })}
        </Text>
      </View>
      <Progress />
      <View style={styles.times}>
        <Times />
      </View>
      <Controls />
    </View>
  );
}

export function WidePlayer() {
  const { bundle, recitation } = useListening();
  const { palette, lang } = useSettings();
  const reciter = bundle.reciters[recitation.reciter]?.name ?? recitation.reciter;
  return (
    <View style={[styles.wide, { borderTopColor: palette.line }]}>
      <View style={styles.wideNow}>
        <View style={[styles.art, { backgroundColor: palette.fold }]}>
          <Logo size={30} color={palette.fg} dot={palette.accent} />
        </View>
        <View style={styles.shrink}>
          <Text numberOfLines={1} style={[styles.artTitle, { color: palette.fg }]}>
            {bundle.poem.title}
          </Text>
          <Text numberOfLines={1} style={[styles.small, { color: palette.muted, fontFamily: fonts.ui }]}>
            {bundle.poet.name} · <NowLabel />
          </Text>
        </View>
      </View>
      <View style={styles.wideMid}>
        <Controls wide />
        <View style={styles.wideBar}>
          <View style={styles.timeBox}>
            <TimeNow />
          </View>
          <View style={styles.flex}>
            <Progress />
          </View>
          <View style={styles.timeBox}>
            <Text style={[styles.time, { color: palette.muted, fontFamily: fonts.ui }]}>{clock(recitation.duration, lang)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.wideEnd}>
        <Text numberOfLines={2} style={[styles.small, { color: palette.muted, fontFamily: fonts.ui, textAlign: "center" }]}>
          {t(lang, "recitedBy", { name: reciter })}
        </Text>
      </View>
    </View>
  );
}

function TimeNow() {
  const { playback } = useListening();
  const { palette, lang } = useSettings();
  const time = useTime(playback);
  return <Text style={[styles.time, { color: palette.muted, fontFamily: fonts.ui }]}>{clock(time, lang)}</Text>;
}

const styles = StyleSheet.create({
  bar: { height: 22, justifyContent: "center", cursor: "pointer" },
  track: { position: "absolute", left: 0, right: 0, height: 3, borderRadius: 2 },
  fill: { position: "absolute", height: 3, borderRadius: 2 },
  head: { position: "absolute", width: 12, height: 12, borderRadius: 1, transform: [{ rotate: "45deg" }] },
  times: { flexDirection: "row", justifyContent: "space-between", marginTop: -6 },
  time: { fontSize: 11, fontVariant: ["tabular-nums"] },
  ctrls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 2 },
  ctrlsWide: { justifyContent: "center", gap: 14 },
  play: { alignItems: "center", justifyContent: "center" },
  phone: { paddingTop: 8, paddingBottom: 14, paddingHorizontal: 18, gap: 5, borderTopWidth: 1, zIndex: 5 },
  now: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  small: { fontSize: 11 },
  shrink: { flexShrink: 1, minWidth: 0 },
  flex: { flex: 1 },
  wide: { flexDirection: "row", alignItems: "center", gap: 24, paddingVertical: 8, paddingHorizontal: 22, borderTopWidth: 1 },
  wideNow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, minWidth: 0 },
  art: { width: 46, height: 46, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  artTitle: { fontFamily: fonts.verseBold, fontSize: 17, lineHeight: 26, writingDirection: "rtl" },
  wideMid: { flex: 1.5, minWidth: 0 },
  wideBar: { flexDirection: "row", alignItems: "center", gap: 10 },
  timeBox: { minWidth: 32, alignItems: "center" },
  wideEnd: { flex: 1, alignItems: "flex-end" },
});
