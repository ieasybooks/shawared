import type { AudioPlaylistStatus } from "expo-audio";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { player, stillPlaying, type NowItem } from "./player";
import { forgetLists, rememberList } from "./queue";
import type { Status } from "./types";

// A stand-in for expo-audio's playlist: `playing` is what it was asked to do; each test sends the
// status updates a platform would, and moves it to another slot as the system does when a
// recording ends or a lock-screen button is pressed.
const { lists, FakePlaylist, env } = vi.hoisted(() => {
  const env = { os: "ios", stored: null as string | null, catalog: undefined as unknown, late: null as null | ((c: unknown) => void) };
  class FakePlaylist {
    sources: string[];
    currentIndex = 0;
    currentTime = 0;
    playing = false;
    private listener: ((s: AudioPlaylistStatus) => void) | null = null;
    constructor(sources: { uri: string }[]) {
      this.sources = sources.map((s) => s.uri);
    }
    play = vi.fn(() => {
      this.playing = true;
    });
    pause = vi.fn(() => {
      this.playing = false;
    });
    seekTo = vi.fn(async (t: number) => {
      this.currentTime = t;
    });
    skipTo = vi.fn((i: number) => {
      this.currentIndex = i;
      this.currentTime = 0;
    });
    add = vi.fn((s: { uri: string }) => {
      this.sources.push(s.uri);
    });
    insert = vi.fn((s: { uri: string }, i: number) => {
      this.sources.splice(i, 0, s.uri);
      if (i <= this.currentIndex) this.currentIndex++;
    });
    remove = vi.fn((i: number) => {
      this.sources.splice(i, 1);
    });
    setActiveForLockScreen = vi.fn();
    updateLockScreenMetadata = vi.fn();
    destroy = vi.fn();
    release = vi.fn();
    get currentStatus() {
      return this.status({ playing: this.playing });
    }
    addListener(_event: string, listener: (s: AudioPlaylistStatus) => void) {
      this.listener = listener;
      return { remove: () => (this.listener = null) };
    }
    status(patch: Partial<AudioPlaylistStatus>) {
      const base = {
        currentIndex: this.currentIndex,
        currentTime: this.currentTime,
        playing: false,
        isBuffering: false,
        isLoaded: true,
        didJustFinish: false,
      };
      return { ...base, ...patch } as AudioPlaylistStatus;
    }
    emit(patch: Partial<AudioPlaylistStatus> = {}) {
      this.listener?.(this.status(patch));
    }
    /** The system moves to slot `i` and plays it. */
    moveTo(i: number) {
      this.currentIndex = i;
      this.currentTime = 0;
      this.playing = true;
      this.emit({ playing: true });
    }
  }
  return { lists: [] as InstanceType<typeof FakePlaylist>[], FakePlaylist, env };
});

// Every audio mode set, kept across tests: the session is set up once.
const modes = vi.hoisted(() => [] as unknown[]);
vi.mock("expo-audio", () => ({
  createAudioPlaylist: ({ sources }: { sources: { uri: string }[] }) => {
    const list = new FakePlaylist(sources);
    lists.push(list);
    return list;
  },
  setAudioModeAsync: async (mode: unknown) => void modes.push(mode),
}));
vi.mock("react-native", () => ({
  Platform: {
    get OS() {
      return env.os;
    },
  },
  AppState: { addEventListener: () => ({ remove() {} }) },
}));
const setItem = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: async () => env.stored, setItem },
}));

// Four poems on the home page, newest first; a and c are one poet's.
const rec = (id: string, duration = 30) => ({ id: "osama", reciter: "osama", duration, audio: `${id}/osama.m4a` });
const CATALOG = {
  schema: 1,
  poems: ["a", "b", "c", "d"].map((id) => ({
    id,
    title: `title ${id}`,
    poet: id === "a" || id === "c" ? "p1" : "p2",
    abyat: 2,
    recitations: [rec(id)],
  })),
  poets: { p1: { id: "p1", name: "الشاعر الأول", names: { en: "First Poet" } }, p2: { id: "p2", name: "الشاعر الثاني", names: {} } },
  reciters: { osama: { id: "osama", name: "أسامة الواعظ", names: { en: "Osama Alwaaedh" } } },
  meters: {},
};
const bundle = (id: string) => ({
  schema: 1,
  lang: "ar",
  poem: { id, poet: "p1", title: `title ${id}`, abyat: [{ n: 1 }, { n: 2 }] },
  recitations: [{ ...rec(id), timeline: [["1.1", 2, 5]] }],
  poet: { id: "p1", name: "الشاعر الأول" },
  reciters: { osama: { id: "osama", name: "أسامة الواعظ" } },
});
vi.mock("../../lib/content", () => ({
  audioUrl: (key: string) => `/audio/${key}`,
  ARTWORK_URL: "https://shawared.com/artwork.png",
  catalogNow: () => env.catalog,
  loadCatalog: () => new Promise((resolve) => (env.late = resolve)),
  loadPoem: async (id: string) => bundle(id),
}));

const url = (id: string) => `/audio/${id}/osama.m4a`;
const flush = () => new Promise((r) => setTimeout(r, 0));

const itemOf = (id: string, timeline: [string, number, number][] = [["1.1", 2, 5]], duration = 30): NowItem => ({
  poemId: id,
  title: `title ${id}`,
  poet: "الشاعر الأول",
  reciter: "أسامة الواعظ",
  abyat: 2,
  lang: "ar",
  recitation: { ...rec(id, duration), timeline },
});
const item = itemOf("b");
const last = () => lists.at(-1)!;
const status = (patch: Partial<Status>): Status => ({
  index: 0,
  time: 0,
  playing: false,
  buffering: false,
  loaded: true,
  finished: false,
  ...patch,
});

beforeEach(() => {
  player.close();
  player.setContinuous(true, false);
  player.repeat.set({ on: false });
  forgetLists();
  env.os = "ios";
  env.catalog = CATALOG;
  lists.length = 0;
});

describe("stillPlaying", () => {
  it("keeps a recitation playing while it starts, as each platform reports that", () => {
    // The web: not playing until its time moves, though it was asked to play.
    expect(stillPlaying(true, status({}), { playing: true })).toBe(true);
    // iOS: waiting to play, buffering, or between one poem and the next.
    expect(stillPlaying(true, status({ buffering: true }), { playing: false })).toBe(true);
    // Android: playing, as it was asked to, while it buffers.
    expect(stillPlaying(true, status({ playing: true, buffering: true }), { playing: true })).toBe(true);
  });

  it("stops it on a pause or at the end", () => {
    expect(stillPlaying(true, status({}), { playing: false })).toBe(false);
    expect(stillPlaying(true, status({ finished: true, buffering: true }), { playing: true })).toBe(false);
  });

  it("doesn't start a paused recitation that's loading, but follows one played from the lock screen", () => {
    expect(stillPlaying(false, status({ buffering: true }), { playing: false })).toBe(false);
    expect(stillPlaying(false, status({}), { playing: true })).toBe(false);
    expect(stillPlaying(false, status({ playing: true }), { playing: true })).toBe(true);
  });
});

describe("the player", () => {
  it("pauses at the first tap while the recording is starting", () => {
    player.play(item);
    const list = last();
    // Loaded, but its time hasn't moved yet: its status says it isn't playing.
    list.emit({ currentIndex: 1 });
    expect(player.clock.get().playing).toBe(true);
    player.toggle();
    expect(list.pause).toHaveBeenCalledOnce();
    expect(list.play).toHaveBeenCalledOnce();
    expect(player.clock.get().playing).toBe(false);
    list.emit({});
    expect(player.clock.get().playing).toBe(false);
  });

  it("stops when the lock screen or the system pauses it, and plays again when it resumes", () => {
    player.play(item);
    const list = last();
    list.currentTime = 4;
    list.emit({ playing: true });
    list.playing = false;
    list.currentTime = 6;
    list.emit({});
    expect(player.clock.get()).toMatchObject({ playing: false, time: 6 });
    list.playing = true;
    list.emit({ playing: true });
    expect(player.clock.get().playing).toBe(true);
  });

  it("starts where it was asked to once the recording is loaded", () => {
    player.play(item, 12);
    const list = last();
    expect(list.seekTo).not.toHaveBeenCalled();
    list.emit({ isLoaded: false });
    expect(list.seekTo).not.toHaveBeenCalled();
    list.emit({});
    expect(list.seekTo).toHaveBeenCalledWith(12);
  });

  it("sets the audio session up to play in the background and own the lock screen", () => {
    player.play(item);
    expect(modes).toEqual([{ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMixPersistent" }]);
  });

  it("queues the poems on either side in the home page's order, and shows the poem on the lock screen", () => {
    player.play(item);
    const list = last();
    expect(list.sources).toEqual([url("a"), url("b"), url("c")]);
    expect(list.skipTo).toHaveBeenCalledWith(1);
    expect(list.setActiveForLockScreen).toHaveBeenCalledWith(
      true,
      {
        title: "title b",
        artist: "الشاعر الأول · إلقاء أسامة الواعظ",
        albumTitle: "شوارد",
        artworkUrl: "https://shawared.com/artwork.png",
      },
      { showPreviousTrack: true, showNextTrack: true },
    );
  });

  it("plays the next poem when one ends, and queues the one after it", async () => {
    player.play(item);
    const list = last();
    list.moveTo(2);
    expect(player.now.get()).toMatchObject({ item: { poemId: "c", title: "title c", poet: "الشاعر الأول" }, from: "b" });
    expect(player.clock.get()).toMatchObject({ playing: true, time: 0 });
    expect(list.add).toHaveBeenCalledWith({ uri: url("d") });
    expect(list.updateLockScreenMetadata).toHaveBeenLastCalledWith(expect.objectContaining({ title: "title c" }));
    // Its timings arrive with its file.
    await flush();
    expect(player.now.get().track?.segments).toHaveLength(1);
    // The last poem: nothing after it, and no next button.
    list.moveTo(3);
    expect(player.now.get().item?.poemId).toBe("d");
    expect(list.add).toHaveBeenCalledOnce();
    expect(list.setActiveForLockScreen).toHaveBeenLastCalledWith(true, expect.objectContaining({ title: "title d" }), {
      showPreviousTrack: true,
      showNextTrack: false,
    });
    // It ends, and that is the end.
    list.playing = false;
    list.currentTime = 30;
    list.emit({ didJustFinish: true });
    expect(player.clock.get()).toMatchObject({ playing: false, time: 30 });
  });

  it("plays the list the poem was opened from", () => {
    // c, opened from its poet's page: a, c.
    rememberList("c", ["a", "c"]);
    player.play(itemOf("c"));
    const list = last();
    expect(list.sources).toEqual([url("a"), url("c")]);
    expect(list.setActiveForLockScreen).toHaveBeenCalledWith(true, expect.anything(), { showPreviousTrack: true, showNextTrack: false });
  });

  it("goes back a poem at the lock screen, keeping one before it", () => {
    player.play(itemOf("c"));
    const list = last();
    expect(list.sources).toEqual([url("b"), url("c"), url("d")]);
    list.moveTo(0);
    expect(player.now.get().item?.poemId).toBe("b");
    expect(list.insert).toHaveBeenCalledWith({ uri: url("a") }, 0);
    // The playlist now holds a, b, c, d, with b in its second slot.
    list.emit({ playing: true });
    expect(player.now.get().item?.poemId).toBe("b");
  });

  it("ignores a status sent before a skip", () => {
    player.play(item, 3);
    const list = last();
    // Sent by the first slot (a) before the skip to b.
    list.emit({ currentIndex: 0, currentTime: 50 });
    expect(player.now.get().item?.poemId).toBe("b");
    expect(player.clock.get().time).toBe(3);
    expect(list.seekTo).not.toHaveBeenCalled();
  });

  it("stops after the poem when autoplay is off, and keeps that choice", () => {
    player.setContinuous(false);
    expect(setItem).toHaveBeenLastCalledWith("shawared.player.v1", JSON.stringify({ continuous: false }));
    player.play(item);
    const list = last();
    expect(list.sources).toEqual([url("a"), url("b")]);
    expect(list.setActiveForLockScreen).toHaveBeenLastCalledWith(true, expect.anything(), {
      showPreviousTrack: true,
      showNextTrack: false,
    });
    // Turned on: the next poem is queued, and the lock screen offers it.
    player.setContinuous(true);
    expect(list.add).toHaveBeenCalledWith({ uri: url("c") });
    expect(list.setActiveForLockScreen).toHaveBeenLastCalledWith(true, expect.anything(), { showPreviousTrack: true, showNextTrack: true });
    // Off again: it goes.
    player.setContinuous(false);
    expect(list.remove).toHaveBeenCalledWith(2);
  });

  it("on iOS, never starts a poem over to queue one before it", async () => {
    env.catalog = undefined;
    player.play(item);
    const list = last();
    list.currentTime = 10;
    list.emit({ playing: true });
    env.late!(CATALOG);
    await flush();
    player.setContinuous(false);
    player.setContinuous(true);
    expect(list.insert).not.toHaveBeenCalled();
    expect(list.sources).toEqual([url("b"), url("c")]);
    // Once the next poem starts, the one it came from is the one before it.
    list.moveTo(1);
    expect(player.now.get().item?.poemId).toBe("c");
    expect(list.setActiveForLockScreen).toHaveBeenLastCalledWith(true, expect.anything(), { showPreviousTrack: true, showNextTrack: true });
  });

  it("reads the reader's autoplay choice from the device", async () => {
    env.stored = JSON.stringify({ continuous: false });
    (player as unknown as { restored: boolean }).restored = false;
    player.restore();
    await flush();
    expect(player.continuous.get().on).toBe(false);
    env.stored = null;
  });

  it("on Android, keeps the lock screen's buttons it started with", () => {
    env.os = "android";
    player.play(itemOf("c"));
    const list = last();
    list.moveTo(2);
    expect(player.now.get().item?.poemId).toBe("d");
    expect(list.setActiveForLockScreen).toHaveBeenCalledOnce();
    expect(list.updateLockScreenMetadata).toHaveBeenLastCalledWith(expect.objectContaining({ title: "title d" }));
  });

  it("queues the poems around it once the catalog arrives", async () => {
    env.catalog = undefined;
    env.os = "android";
    player.play(item);
    const list = last();
    expect(list.sources).toEqual([url("b")]);
    env.late!(CATALOG);
    await flush();
    // Android takes a poem before the one playing without a break; iOS would start it over.
    expect(list.sources).toEqual([url("a"), url("b"), url("c")]);
    list.emit({ currentIndex: 1, playing: true });
    expect(player.now.get().item?.poemId).toBe("b");
  });

  it("repeats the last bayt before the recording ends, so the next poem doesn't start", () => {
    player.repeat.set({ on: true });
    player.play(
      itemOf("b", [
        ["1.1", 2, 5],
        ["2.1", 25, 29.9],
      ]),
    );
    const list = last();
    // In the background, statuses are all there is.
    list.currentTime = 26;
    list.emit({ playing: true });
    list.currentTime = 29.6;
    list.emit({ playing: true });
    expect(list.seekTo).toHaveBeenLastCalledWith(25 - 0.12);
  });

  it("plays a finished queue's last poem again from the start", () => {
    player.play(itemOf("d"));
    const list = last();
    list.playing = false;
    list.currentTime = 30;
    list.emit({ didJustFinish: true });
    player.play();
    // iOS let go of it: it's loaded again, then sought.
    expect(list.skipTo).toHaveBeenLastCalledWith(1);
    list.currentTime = 0;
    list.emit({});
    expect(list.seekTo).toHaveBeenLastCalledWith(0);
    expect(list.play).toHaveBeenCalledTimes(2);
  });

  it("queues the next poem when autoplay comes on after the end, once the poem plays again", () => {
    player.setContinuous(false);
    player.play(item);
    const list = last();
    list.playing = false;
    list.currentTime = 30;
    list.emit({ didJustFinish: true });
    player.setContinuous(true);
    expect(list.add).not.toHaveBeenCalled();
    player.play();
    expect(list.add).toHaveBeenCalledWith({ uri: url("c") });
    expect(player.now.get().item?.poemId).toBe("b");
  });

  it("closing stops it and takes it off the lock screen", () => {
    player.play(item);
    const list = last();
    player.close();
    expect(list.pause).toHaveBeenCalled();
    expect(list.destroy).toHaveBeenCalled();
    expect(list.release).toHaveBeenCalled();
    expect(player.now.get().item).toBeNull();
  });
});
