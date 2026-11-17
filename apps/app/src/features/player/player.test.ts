import type { AudioStatus } from "expo-audio";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { player, stillPlaying } from "./player";

// A stand-in for expo-audio's player: `playing` is what the player was asked to do, as the web
// keeps it; each test sends the status updates a platform would.
const { audios, FakeAudio } = vi.hoisted(() => {
  class FakeAudio {
    playing = false;
    currentTime = 0;
    private listener: ((s: AudioStatus) => void) | null = null;
    play = vi.fn(() => {
      this.playing = true;
    });
    pause = vi.fn(() => {
      this.playing = false;
    });
    seekTo = vi.fn(async () => {});
    remove = vi.fn();
    setActiveForLockScreen = vi.fn();
    addListener(_event: string, listener: (s: AudioStatus) => void) {
      this.listener = listener;
      return { remove: () => (this.listener = null) };
    }
    // The fields the player reads.
    emit(patch: Partial<AudioStatus>) {
      const status = { playing: false, isBuffering: false, didJustFinish: false, isLoaded: true, currentTime: this.currentTime };
      this.listener?.({ ...status, ...patch } as AudioStatus);
    }
  }
  return { audios: [] as InstanceType<typeof FakeAudio>[], FakeAudio };
});

vi.mock("expo-audio", () => ({
  createAudioPlayer: () => {
    const audio = new FakeAudio();
    audios.push(audio);
    return audio;
  },
  setAudioModeAsync: async () => {},
}));
vi.mock("../../lib/content", () => ({ audioUrl: (key: string) => `/audio/${key}` }));

const status = (patch: Partial<AudioStatus>) => ({ playing: false, isBuffering: false, didJustFinish: false, ...patch }) as AudioStatus;

const item = {
  poemId: "taqulu-buthaynatu",
  title: "تَقولُ بُثَينَةُ لَمّا رَأَت",
  poet: "جَميل بُثَينة",
  reciter: "أسامة الواعظ",
  abyat: 10,
  recitation: {
    id: "osama",
    reciter: "osama",
    audio: "taqulu-buthaynatu/osama.m4a",
    duration: 30,
    timeline: [["1.1", 2, 5] as [string, number, number]],
  },
};

describe("stillPlaying", () => {
  it("keeps a recitation playing while it starts, as each platform reports that", () => {
    // The web: not playing until its time moves, though it was asked to play.
    expect(stillPlaying(true, status({}), { playing: true })).toBe(true);
    // iOS: waiting to play, buffering.
    expect(stillPlaying(true, status({ isBuffering: true }), { playing: false })).toBe(true);
    // Android: playing, as it was asked to, while it buffers.
    expect(stillPlaying(true, status({ playing: true, isBuffering: true }), { playing: true })).toBe(true);
  });

  it("stops it on a pause or at the end", () => {
    expect(stillPlaying(true, status({}), { playing: false })).toBe(false);
    expect(stillPlaying(true, status({ didJustFinish: true, isBuffering: true }), { playing: true })).toBe(false);
  });

  it("doesn't start a paused recitation that's loading, but follows one played from the lock screen", () => {
    expect(stillPlaying(false, status({ isBuffering: true }), { playing: false })).toBe(false);
    expect(stillPlaying(false, status({}), { playing: true })).toBe(false);
    expect(stillPlaying(false, status({ playing: true }), { playing: true })).toBe(true);
  });
});

describe("player", () => {
  beforeEach(() => player.close());

  it("pauses at the first tap while the recording is starting", () => {
    player.play(item);
    const audio = audios.at(-1)!;
    // The web loaded the recording but hasn't moved its time: its status says it isn't playing.
    audio.emit({ isLoaded: true });
    expect(player.clock.get().playing).toBe(true);
    player.toggle();
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.play).toHaveBeenCalledOnce();
    expect(player.clock.get().playing).toBe(false);
    audio.emit({ isLoaded: true });
    expect(player.clock.get().playing).toBe(false);
  });

  it("stops when the lock screen or the system pauses it, and plays again when it resumes", () => {
    player.play(item);
    const audio = audios.at(-1)!;
    audio.currentTime = 4;
    audio.emit({ playing: true });
    audio.playing = false;
    audio.currentTime = 6;
    audio.emit({});
    expect(player.clock.get()).toMatchObject({ playing: false, time: 6 });
    audio.playing = true;
    audio.emit({ playing: true });
    expect(player.clock.get().playing).toBe(true);
  });

  it("stops at the end", () => {
    player.play(item);
    const audio = audios.at(-1)!;
    audio.emit({ playing: true });
    audio.currentTime = 30;
    audio.emit({ didJustFinish: true });
    expect(player.clock.get()).toMatchObject({ playing: false, time: 30 });
  });
});
