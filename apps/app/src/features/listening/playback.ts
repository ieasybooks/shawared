import type { PublishedRecitation } from "@shawared/contracts";
import { buildTrack, lineAt, segmentAt, type Track } from "@shawared/listening";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useEffect, useMemo } from "react";
import { audioUrl } from "../../lib/content";
import { createStore, useStore, type Store } from "../../lib/store";

export type Clock = { time: number; playing: boolean; ready: boolean; buffering: boolean; /** Bumped by every seek. */ seq: number };

export type Playback = {
  track: Track;
  clock: Store<Clock>;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
};

let audioModeSet = false;

/** One recording: an audio player, its clock, and the timeline the clock is read against. */
export function usePlayback(recitation: PublishedRecitation): Playback {
  const player = useAudioPlayer({ uri: audioUrl(recitation.audio) }, { updateInterval: 250 });
  const track = useMemo(() => buildTrack(recitation.timeline, recitation.duration), [recitation]);
  const clock = useMemo(() => createStore<Clock>({ time: 0, playing: false, ready: false, buffering: false, seq: 0 }), []);

  useEffect(() => {
    if (audioModeSet) return;
    audioModeSet = true;
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => {});
  }, []);

  // The player's own status: playing, loaded, buffering.
  useEffect(() => {
    const sub = player.addListener("playbackStatusUpdate", (s) => {
      clock.set({ playing: s.playing, ready: s.isLoaded, buffering: s.isBuffering, ...(s.playing ? {} : { time: s.currentTime }) });
    });
    return () => sub.remove();
  }, [player, clock]);

  // While playing, read the position every frame so highlighting and the progress bar move smoothly.
  const playing = useStore(clock, (s) => s.playing);
  useEffect(() => {
    if (!playing) return;
    let id = 0;
    const tick = () => {
      clock.set({ time: player.currentTime });
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, player, clock]);

  return useMemo<Playback>(() => {
    const seek = (seconds: number) => {
      const s = Math.max(0, Math.min(recitation.duration - 0.05, seconds));
      clock.set({ time: s, seq: clock.get().seq + 1 });
      player.seekTo(s).catch(() => {});
    };
    const play = () => {
      if (player.currentTime >= recitation.duration - 0.3) seek(0);
      player.play();
      clock.set({ playing: true });
    };
    const pause = () => {
      player.pause();
      clock.set({ playing: false, time: player.currentTime });
    };
    return { track, clock, play, pause, seek, toggle: () => (clock.get().playing ? pause() : play()) };
  }, [player, track, clock, recitation.duration]);
}

const lineOf = (track: Track) => (s: Clock) => lineAt(track, s.time);
const segmentOf = (track: Track) => (s: Clock) => segmentAt(track, s.time);

/** The line being recited, re-rendering only when it changes. */
export function useCurrentLine(p: Playback) {
  const select = useMemo(() => lineOf(p.track), [p.track]);
  return useStore(p.clock, select);
}

export function useCurrentSegment(p: Playback) {
  const select = useMemo(() => segmentOf(p.track), [p.track]);
  return useStore(p.clock, select);
}

const selectTime = (s: Clock) => s.time;
const selectPlaying = (s: Clock) => s.playing;
export const useTime = (p: Playback) => useStore(p.clock, selectTime);
export const usePlaying = (p: Playback) => useStore(p.clock, selectPlaying);
