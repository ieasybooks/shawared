import { space } from "@shawared/design";
import { nextTarget, previousTarget, segmentAt, type Track } from "@shawared/listening";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { IconButton, type PressState } from "../../components/ui/controls";
import type { TipText } from "../../components/ui/Tip";
import { Eq } from "../../components/ui/Eq";
import { Icon, type IconName } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { clock, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useStore, type Store } from "../../lib/store";
import { useType } from "../../lib/type";
import { FavouriteButton } from "../saved/SavedButtons";
import { player, type Clock, type Now, type RepeatMode } from "./player";

const web = Platform.OS === "web";

/**
 * What a player bar plays: the app's current recitation (every page but a poem's), or a poem
 * page's own, which is ready to start before it is the one playing.
 */
export type BarSource = {
  poemId: string;
  title: string;
  poet: string;
  reciter: string;
  reciterId: string;
  abyat: number;
  duration: number;
  track: Track;
  clock: Store<Clock>;
  toggle: () => void;
  /** Go to a time: the poem page also goes back to following the recitation. */
  jump: (seconds: number) => void;
  /** Stops and hides the player: the bar on pages other than the poem's. */
  close?: () => void;
  /** The title leads to the poem: the bar on pages other than the poem's. */
  linkTitle?: boolean;
};

const selectNow = (s: Now) => s;

/** The app's current recitation as a bar's source, or null when nothing is playing. */
export function useCurrentSource(): BarSource | null {
  const { item, track } = useStore(player.now, selectNow);
  if (!item || !track) return null;
  return {
    ...item,
    reciterId: item.recitation.reciter,
    duration: item.recitation.duration,
    track,
    clock: player.clock,
    toggle: () => player.toggle(),
    jump: (s) => player.seek(s),
    close: () => player.close(),
    linkTitle: true,
  };
}

const selectTime = (s: Clock) => s.time;
const selectPlaying = (s: Clock) => s.playing;
const selectOn = (s: { on: boolean }) => s.on;
const selectRepeat = (s: { mode: RepeatMode }) => s.mode;

function useBayt(source: BarSource) {
  const { track } = source;
  const select = useCallback((s: Clock) => track.segments[segmentAt(track, s.time)]?.n ?? 1, [track]);
  return useStore(source.clock, select);
}

/** "Verse 4 of 32", following the recitation. */
function VerseOf({ source }: { source: BarSource }) {
  const { lang } = useSettings();
  const n = useBayt(source);
  return <>{t(lang, "now", { n, N: source.abyat })}</>;
}

function PlayingEq({ source }: { source: BarSource }) {
  const { palette } = useSettings();
  const playing = useStore(source.clock, selectPlaying);
  return <Eq on={playing} color={palette.accent} />;
}

/** The round play button, ink on the page. */
function PlayButton({ source, size }: { source: BarSource; size: number }) {
  const { palette, lang } = useSettings();
  const playing = useStore(source.clock, selectPlaying);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(lang, playing ? "pause" : "play")}
      onPress={source.toggle}
      style={(s: PressState) => [
        styles.play,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.fg },
        (s.hovered || s.pressed) && styles.playHover,
      ]}
    >
      <Icon name={playing ? "pause" : "play"} size={Math.round(size * 0.4)} color={palette.bg} />
    </Pressable>
  );
}

/** The seek bar: an ink fill from the start of the reading direction, with a slim thumb. */
export const SeekBar = memo(function SeekBar({ source }: { source: BarSource }) {
  const { palette, rtl, lang } = useSettings();
  const time = useStore(source.clock, selectTime);
  const width = useRef(0);
  const [drag, setDrag] = useState<number | null>(null);
  const total = source.duration;
  const pct = Math.min(1, Math.max(0, (drag ?? time) / total));
  const at = (e: GestureResponderEvent) => {
    const x = Math.max(0, Math.min(width.current, e.nativeEvent.locationX));
    const f = width.current ? x / width.current : 0;
    return (rtl ? 1 - f : f) * total;
  };
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
        source.jump(at(e));
        setDrag(null);
      }}
      onResponderTerminate={() => setDrag(null)}
      style={styles.bar}
    >
      <View pointerEvents="none" style={[styles.track, { backgroundColor: palette.fold, borderColor: palette.line }]} />
      <View pointerEvents="none" style={[styles.fill, { backgroundColor: palette.fg, width: `${pct * 100}%`, start: 0 }]} />
      <View pointerEvents="none" style={[styles.thumb, { backgroundColor: palette.fg, start: `${pct * 100}%` }]} />
    </View>
  );
});

function TimeNow({ source }: { source: BarSource }) {
  const { palette, lang } = useSettings();
  const type = useType();
  const time = useStore(source.clock, selectTime);
  return <Text style={[type.label, styles.tabular, { color: palette.muted }]}>{clock(time, lang)}</Text>;
}

/** Time so far, the bar, the whole length. The boxes keep the length's width, so nothing shifts. */
function ProgressRow({ source }: { source: BarSource }) {
  const { palette, lang } = useSettings();
  const type = useType();
  const total = clock(source.duration, lang);
  return (
    <View style={styles.progressRow}>
      <View style={styles.timeBox}>
        <Text aria-hidden style={[type.label, styles.tabular, styles.ghost]}>
          {total}
        </Text>
        <View style={styles.timeOver}>
          <TimeNow source={source} />
        </View>
      </View>
      <View style={styles.flex}>
        <SeekBar source={source} />
      </View>
      <Text style={[type.label, styles.tabular, { color: palette.muted }]}>{total}</Text>
    </View>
  );
}

/** A control of the bar: an icon, saffron with a nuqta under it when on. */
function Control({
  icon,
  label,
  onPress,
  on,
  dim,
  size = 38,
  iconSize = 22,
  tip,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  on?: boolean;
  /** Set, but doing nothing for now (autoplay while the poem repeats). */
  dim?: boolean;
  size?: number;
  iconSize?: number;
  tip?: TipText | undefined;
}) {
  const { palette } = useSettings();
  return (
    <IconButton
      style={dim ? styles.dim : undefined}
      icon={icon}
      label={label}
      onPress={onPress}
      size={size}
      iconSize={iconSize}
      color={on ? palette.accent : palette.muted}
      {...(on === undefined ? {} : { pressed: on })}
      tip={tip}
    />
  );
}

function useSkips(source: BarSource) {
  const back = () => source.jump(source.clock.get().time - 10);
  const forward = () => source.jump(source.clock.get().time + 10);
  const prev = () => source.jump(previousTarget(source.track, source.clock.get().time));
  const next = () => {
    const to = nextTarget(source.track, source.clock.get().time);
    if (to !== null) source.jump(to);
  };
  return { back, forward, prev, next };
}

const REPEAT_STATE = { off: "isOff", poem: "repeatPoem", bayt: "repeatBayt" } as const;
const REPEAT_TIP = { off: "repeatTipOff", poem: "repeatTipPoem", bayt: "repeatTipBayt" } as const;

/**
 * Repeat, one button with three steps: off, the whole poem, the bayt being recited ("١" on the
 * icon). `tip` lines its tip up with that edge of the button (wide windows).
 */
function RepeatButton({ size, iconSize, tip }: { size?: number; iconSize?: number; tip?: TipText["align"] }) {
  const { lang } = useSettings();
  const mode = useStore(player.repeat, selectRepeat);
  const state = t(lang, REPEAT_STATE[mode]);
  return (
    <Control
      icon={mode === "bayt" ? "repeatOne" : "repeat"}
      label={`${t(lang, "repeat")}: ${state}`}
      on={mode !== "off"}
      onPress={() => player.cycleRepeat()}
      size={size}
      iconSize={iconSize}
      tip={tip && { title: t(lang, "repeat"), state, body: t(lang, REPEAT_TIP[mode]), align: tip }}
    />
  );
}

/** Autoplay (∞): the next poem in the list when one ends. Faded while repeat is on: the poem never ends then. */
function ContinuousButton({ size, iconSize, tip }: { size?: number; iconSize?: number; tip?: TipText["align"] }) {
  const { lang } = useSettings();
  const on = useStore(player.continuous, selectOn);
  const held = useStore(player.repeat, selectRepeat) !== "off";
  useEffect(() => player.restore(), []);
  return (
    <Control
      icon="continuous"
      label={t(lang, "continuous")}
      on={on}
      dim={held}
      onPress={() => player.setContinuous(!on)}
      size={size}
      iconSize={iconSize}
      tip={
        tip && {
          title: t(lang, "continuous"),
          state: t(lang, on ? "isOn" : "isOff"),
          body: held ? `${t(lang, "continuousTip")} ${t(lang, "continuousHeld")}` : t(lang, "continuousTip"),
          align: tip,
        }
      }
    />
  );
}

function MuteButton() {
  const { lang } = useSettings();
  const on = useStore(player.muted, selectOn);
  return (
    <Control
      icon={on ? "volumeOff" : "volume"}
      label={t(lang, on ? "unmute" : "mute")}
      onPress={() => player.setMuted(!on)}
      iconSize={22}
    />
  );
}

/** The poem's title: a link back to it on other pages. */
function Title({ source }: { source: BarSource }) {
  const { palette, href } = useSettings();
  const type = useType();
  const text = (
    <Text numberOfLines={1} style={[type.smallTitle, styles.rtl, { color: palette.fg }]}>
      {source.title}
    </Text>
  );
  if (!source.linkTitle) return <View style={styles.shrink}>{text}</View>;
  return (
    <View style={styles.shrink}>
      <TextLink href={href(paths.poem(source.poemId))}>{text}</TextLink>
    </View>
  );
}

function ReciterLink({ source }: { source: BarSource }) {
  const { palette, lang, href } = useSettings();
  const type = useType();
  return (
    <TextLink href={href(paths.reciter(source.reciterId))}>
      <Text
        numberOfLines={1}
        style={[type.label, { color: palette.muted, textDecorationLine: "underline", textDecorationColor: palette.line2 }]}
      >
        {t(lang, "recitedBy", { name: source.reciter })}
      </Text>
    </TextLink>
  );
}

/** The bar along the bottom of wide windows. */
export function WideBar({ source }: { source: BarSource }) {
  const { palette, lang } = useSettings();
  const type = useType();
  const skips = useSkips(source);
  return (
    <View style={[styles.wide, { backgroundColor: palette.raise, borderTopColor: palette.line }]}>
      <PlayButton source={source} size={56} />
      <View style={styles.wideBody}>
        <View style={styles.titleRow}>
          <PlayingEq source={source} />
          <Title source={source} />
          <Text numberOfLines={1} style={[type.label, styles.noShrink, { color: palette.muted }]}>
            {source.poet} · <VerseOf source={source} /> ·
          </Text>
          <ReciterLink source={source} />
          <View style={styles.flex} />
          {source.close && <IconButton icon="close" label={t(lang, "closePlayer")} onPress={source.close} size={30} iconSize={18} />}
        </View>
        <View style={styles.controlsRow}>
          <View style={styles.group}>
            <RepeatButton size={34} iconSize={20} tip="start" />
            <Control icon="prev" label={t(lang, "prev")} onPress={skips.prev} size={34} iconSize={20} />
            <Control icon="rewind" label={t(lang, "back10")} onPress={skips.back} size={34} iconSize={22} />
            <Control icon="forward" label={t(lang, "forward10")} onPress={skips.forward} size={34} iconSize={22} />
            <Control icon="next" label={t(lang, "next")} onPress={skips.next} size={34} iconSize={20} />
          </View>
          <View style={styles.flex}>
            <ProgressRow source={source} />
          </View>
          <View style={styles.group}>
            <ContinuousButton size={34} iconSize={22} tip="end" />
            <FavouriteButton kind="poems" id={source.poemId} size={34} iconSize={20} />
            {web && <MuteButton />}
          </View>
        </View>
      </View>
    </View>
  );
}

/** The poem page's player on phones: where we are, the bar, then the controls. */
export function PhoneBar({ source }: { source: BarSource }) {
  const { palette, lang } = useSettings();
  const type = useType();
  const skips = useSkips(source);
  return (
    <View style={[styles.phone, { backgroundColor: palette.raise, borderTopColor: palette.line }]}>
      <View style={styles.phoneTop}>
        <PlayingEq source={source} />
        <Text numberOfLines={1} style={[type.label, styles.noShrink, { color: palette.fg }]}>
          <VerseOf source={source} />
        </Text>
        <Text style={[type.label, { color: palette.line2 }]}>·</Text>
        <View style={styles.shrink}>
          <ReciterLink source={source} />
        </View>
        <View style={styles.flex} />
        <RepeatButton size={34} iconSize={19} />
        <View style={styles.phoneContinuous}>
          <ContinuousButton size={34} iconSize={21} />
        </View>
      </View>
      <ProgressRow source={source} />
      <View style={styles.transport}>
        <Control icon="rewind" label={t(lang, "back10")} onPress={skips.back} size={44} iconSize={26} />
        <Control icon="prev" label={t(lang, "prev")} onPress={skips.prev} size={44} iconSize={23} />
        <PlayButton source={source} size={60} />
        <Control icon="next" label={t(lang, "next")} onPress={skips.next} size={44} iconSize={23} />
        <Control icon="forward" label={t(lang, "forward10")} onPress={skips.forward} size={44} iconSize={26} />
      </View>
    </View>
  );
}

/**
 * The bar on wide windows' pages other than a poem's: what is playing, if anything. It slides up
 * when the player starts; a page opened while it plays has it in place already. Every page has its
 * own bar, so `visible` at the first render is the player already showing.
 */
export function GlobalPlayerBar() {
  const source = useCurrentSource();
  const visible = !!source;
  const shown = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const was = useRef(visible);
  useEffect(() => {
    if (!visible) {
      was.current = false;
      shown.setValue(0);
      return;
    }
    if (was.current) return;
    was.current = true;
    Animated.timing(shown, { toValue: 1, duration: 420, easing: Easing.bezier(0.32, 0.72, 0, 1), useNativeDriver: !web }).start();
  }, [visible, shown]);
  if (!source) return null;
  return (
    <Animated.View style={{ opacity: shown, transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }}>
      <WideBar source={source} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  shrink: { flexShrink: 1, minWidth: 0 },
  noShrink: { flexShrink: 0 },
  rtl: { writingDirection: "rtl" },
  tabular: { fontVariant: ["tabular-nums"] },
  dim: { opacity: 0.4 },
  play: { alignItems: "center", justifyContent: "center" },
  playHover: { opacity: 0.88 },
  bar: { height: 22, justifyContent: "center", cursor: "pointer" },
  track: { position: "absolute", left: 0, right: 0, height: 8, borderRadius: 4, borderWidth: 1 },
  fill: { position: "absolute", height: 8, borderRadius: 4 },
  thumb: { position: "absolute", width: 4, height: 16, borderRadius: 2, marginStart: -2 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  timeBox: { alignItems: "center", justifyContent: "center" },
  ghost: { opacity: 0 },
  timeOver: { position: "absolute", top: 0, bottom: 0, start: 0, end: 0, alignItems: "center", justifyContent: "center" },
  wide: { flexDirection: "row", alignItems: "center", gap: 20, paddingVertical: 10, paddingHorizontal: 22, borderTopWidth: 1 },
  wideBody: { flex: 1, minWidth: 0, gap: space.xs },
  titleRow: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 30 },
  controlsRow: { flexDirection: "row", alignItems: "center", gap: space.xl },
  group: { flexDirection: "row", alignItems: "center", gap: space.xxs },
  phone: { paddingTop: space.m, paddingBottom: space.s, paddingHorizontal: space.xl, gap: space.s, borderTopWidth: 1 },
  // Extend the row so autoplay's whole tap area stays inside its parent on native.
  phoneTop: { flexDirection: "row", alignItems: "center", gap: space.s, minHeight: 34, marginEnd: -space.s },
  // Centre autoplay under Appearance while keeping Repeat's column in place.
  phoneContinuous: { marginStart: space.s },
  transport: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.xs },
});
