import { buildTrack, lineAt, segmentAt, type Track } from "@shawared/listening";
import { useMemo } from "react";
import { createStore, useStore, type Store } from "../../lib/store";
import { idleClock, player, type Clock, type NowItem } from "../player/player";

/** A poem screen's view of playback: live when its recitation is the one playing, else ready to start. */
export type Playback = {
  track: Track;
  clock: Store<Clock>;
  /** Whether this screen's recitation is the app's current one. */
  active: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
};

const selectItem = (s: { item: NowItem | null }) => s.item;

export function usePoemPlayback(item: NowItem): Playback {
  const current = useStore(player.now, selectItem);
  const active = !!current && current.poemId === item.poemId && current.recitation.id === item.recitation.id;
  // Keyed by ids: switching language reloads the bundle but not the recording.
  const key = `${item.poemId}/${item.recitation.id}`;
  const track = useMemo(() => buildTrack(item.recitation.timeline, item.recitation.duration), [key]);
  // Until it plays, the screen keeps its own position: the progress bar, previous and next move it.
  const idle = useMemo(() => createStore<Clock>(idleClock()), [key]);

  return useMemo<Playback>(() => {
    if (active) {
      return {
        track,
        clock: player.clock,
        active,
        play: () => player.play(),
        pause: () => player.pause(),
        toggle: () => player.toggle(),
        seek: (t) => player.seek(t),
      };
    }
    const start = () => player.play(item, idle.get().time);
    return {
      track,
      clock: idle,
      active,
      play: start,
      pause: () => {},
      toggle: start,
      seek: (t) => idle.set({ time: Math.max(0, Math.min(item.recitation.duration - 0.05, t)), seq: idle.get().seq + 1 }),
    };
  }, [active, track, idle, item]);
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
