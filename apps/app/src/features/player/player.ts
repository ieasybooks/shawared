// The one audio player of the app. It lives outside any screen, so a recitation keeps
// playing while the reader browses, and the mini player and the poem screen both read it.
// Nothing is created until something is played, so it is safe to import while rendering
// pages ahead of time.
import type { PublishedRecitation } from "@shawared/contracts";
import { buildTrack, PRE_ROLL, REPEAT_GAP, segmentAt, type Track } from "@shawared/listening";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { audioUrl } from "../../lib/content";
import { createStore, type Store } from "../../lib/store";

/** What is playing, with what the mini player and the lock screen show. */
export type NowItem = {
  poemId: string;
  title: string;
  poet: string;
  reciter: string;
  abyat: number;
  recitation: PublishedRecitation;
};

export type Clock = {
  time: number;
  playing: boolean;
  ready: boolean;
  buffering: boolean;
  /** Bumped by every seek, so repeat can tell a reader's jump from playback. */
  seq: number;
};

export const idleClock = (time = 0): Clock => ({ time, playing: false, ready: false, buffering: false, seq: 0 });

const sameItem = (a: NowItem | null, b: NowItem) => !!a && a.poemId === b.poemId && a.recitation.id === b.recitation.id;

class Player {
  readonly now: Store<{ item: NowItem | null; track: Track | null }> = createStore<{ item: NowItem | null; track: Track | null }>({
    item: null,
    track: null,
  });
  readonly clock: Store<Clock> = createStore(idleClock());
  readonly repeat: Store<{ on: boolean }> = createStore<{ on: boolean }>({ on: false });

  private audio: AudioPlayer | null = null;
  private sub: { remove(): void } | null = null;
  private pendingSeek: number | null = null;
  private frame = 0;
  private lockedSegment = -1;
  private lockedSeq = -1;
  private modeSet = false;

  isCurrent(item: NowItem) {
    return sameItem(this.now.get().item, item);
  }

  /** Makes `item` the current recitation, at `at` seconds. Does nothing if it already is. */
  load(item: NowItem, at = 0) {
    if (this.isCurrent(item)) return;
    this.release();
    if (!this.modeSet) {
      this.modeSet = true;
      setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => {});
    }
    const audio = createAudioPlayer({ uri: audioUrl(item.recitation.audio) }, { updateInterval: 250 });
    this.audio = audio;
    this.pendingSeek = at > 0 ? at : null;
    this.now.set({ item, track: buildTrack(item.recitation.timeline, item.recitation.duration) });
    this.clock.set({ ...idleClock(at), buffering: true, seq: this.clock.get().seq + 1 });
    this.sub = audio.addListener("playbackStatusUpdate", (s) => {
      if (s.isLoaded && this.pendingSeek !== null) {
        audio.seekTo(this.pendingSeek).catch(() => {});
        this.pendingSeek = null;
      }
      this.clock.set({
        playing: s.playing,
        ready: s.isLoaded,
        buffering: s.isBuffering,
        ...(s.playing || this.pendingSeek !== null ? {} : { time: s.currentTime }),
      });
      if (s.playing) this.tick();
    });
    try {
      audio.setActiveForLockScreen(true, { title: item.title, artist: `${item.poet} · ${item.reciter}`, albumTitle: "شوارد · Shawared" });
    } catch {
      // Lock-screen controls are a bonus; playback works without them.
    }
  }

  /** Plays the current recitation, or `item` from `at` seconds. */
  play(item?: NowItem, at?: number) {
    if (item && !this.isCurrent(item)) this.load(item, at ?? 0);
    else if (at !== undefined) this.seek(at);
    const audio = this.audio;
    const cur = this.now.get().item;
    if (!audio || !cur) return;
    if (this.clock.get().time >= cur.recitation.duration - 0.3) this.seek(0);
    audio.play();
    this.clock.set({ playing: true });
    this.tick();
  }

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.clock.set({ playing: false, time: this.audio.currentTime });
  }

  toggle() {
    if (this.clock.get().playing) this.pause();
    else this.play();
  }

  seek(seconds: number) {
    const cur = this.now.get().item;
    if (!cur || !this.audio) return;
    const t = Math.max(0, Math.min(cur.recitation.duration - 0.05, seconds));
    this.clock.set({ time: t, seq: this.clock.get().seq + 1 });
    if (!this.clock.get().ready) this.pendingSeek = t;
    else this.audio.seekTo(t).catch(() => {});
  }

  /** Stops and forgets the recitation: the mini player and the lock-screen controls go away. */
  close() {
    this.release();
    this.now.set({ item: null, track: null });
    this.clock.set({ ...idleClock(), seq: this.clock.get().seq + 1 });
  }

  /** While playing, read the position every frame, and loop the bayt when repeat is on. */
  private tick() {
    if (this.frame || typeof requestAnimationFrame === "undefined") return;
    const step = () => {
      this.frame = 0;
      const audio = this.audio;
      if (!audio || !this.clock.get().playing) return;
      if (this.pendingSeek === null) this.clock.set({ time: audio.currentTime });
      if (this.repeat.get().on) this.loopBayt();
      this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  /** Loops the bayt being recited. Any seek by the reader re-aims it. */
  private loopBayt() {
    const { track } = this.now.get();
    const { time, seq } = this.clock.get();
    if (!track) return;
    if (seq !== this.lockedSeq || !track.segments[this.lockedSegment]) {
      this.lockedSegment = segmentAt(track, time);
      this.lockedSeq = seq;
    }
    const seg = track.segments[this.lockedSegment];
    if (!seg) return;
    const next = track.segments[this.lockedSegment + 1];
    const gap = next ? Math.min(REPEAT_GAP, Math.max(0, next.start - seg.end - 0.05)) : REPEAT_GAP;
    if (time >= seg.end + gap) {
      this.seek(Math.max(0, seg.start - PRE_ROLL));
      this.lockedSeq = this.clock.get().seq;
    }
  }

  private release() {
    if (this.frame && typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.sub?.remove();
    this.sub = null;
    if (this.audio) {
      try {
        this.audio.setActiveForLockScreen(false);
      } catch {}
      this.audio.remove();
    }
    this.audio = null;
    this.lockedSegment = -1;
  }
}

export const player = new Player();
