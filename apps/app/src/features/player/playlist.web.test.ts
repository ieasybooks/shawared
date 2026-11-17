import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlaylist } from "./playlist.web";
import type { Status } from "./types";

// A stand-in for an <audio> element, and for the browser's Media Session.
class FakeAudio {
  static made: FakeAudio[] = [];
  src = "";
  preload = "";
  currentTime = 0;
  duration = 30;
  playbackRate = 1;
  paused = true;
  ended = false;
  readyState = 4;
  played: string[] = [];
  private listeners = new Map<string, (() => void)[]>();
  constructor() {
    FakeAudio.made.push(this);
  }
  addEventListener(event: string, fn: () => void) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), fn]);
  }
  fire(event: string) {
    for (const fn of this.listeners.get(event) ?? []) fn();
  }
  play() {
    this.paused = false;
    this.ended = false;
    this.played.push(this.src);
    this.fire("play");
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    this.fire("pause");
  }
  /** Plays to the end, as an element does: it pauses, then says it ended. */
  end() {
    this.currentTime = this.duration;
    this.ended = true;
    this.paused = true;
    this.fire("pause");
    this.fire("ended");
  }
  getAttribute(name: string) {
    return name === "src" && this.src ? this.src : null;
  }
  removeAttribute(name: string) {
    if (name === "src") this.src = "";
  }
  load() {}
}

const handlers = new Map<string, ((details: { seekTime?: number }) => void) | null>();
const mediaSession = {
  metadata: null as unknown,
  playbackState: "none",
  position: null as unknown,
  setActionHandler: (action: string, fn: ((details: { seekTime?: number }) => void) | null) => handlers.set(action, fn),
  setPositionState(state: unknown) {
    this.position = state;
  },
};

beforeEach(() => {
  FakeAudio.made = [];
  handlers.clear();
  mediaSession.metadata = null;
  vi.stubGlobal("Audio", FakeAudio);
  vi.stubGlobal("navigator", { mediaSession });
  vi.stubGlobal(
    "MediaMetadata",
    class {
      constructor(init: object) {
        Object.assign(this, init);
      }
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

const NOW = { title: "تَقولُ بُثَينَةُ", artist: "جميل بثينة · إلقاء أسامة الواعظ", album: "شوارد", artwork: "/artwork.png" };

describe("the web's playlist", () => {
  it("plays the recordings one after another in one element, which a locked iPhone lets go on", () => {
    const statuses: Status[] = [];
    const list = createPlaylist(["/a.m4a", "/b.m4a"], (s) => statuses.push(s));
    const media = FakeAudio.made[0]!;
    list.play();
    expect(media.played).toEqual(["/a.m4a"]);
    media.end();
    expect(FakeAudio.made).toHaveLength(1);
    expect(media.played).toEqual(["/a.m4a", "/b.m4a"]);
    expect(list.index).toBe(1);
    // It never said it stopped between the two.
    expect(statuses.some((s) => !s.playing)).toBe(false);
    expect(statuses.at(-1)).toMatchObject({ index: 1, playing: true, finished: false });
    media.end();
    expect(statuses.at(-1)).toMatchObject({ index: 1, playing: false, finished: true });
  });

  it("loads nothing until a slot is chosen", () => {
    const list = createPlaylist(["/a.m4a", "/b.m4a"], () => {});
    expect(FakeAudio.made[0]!.src).toBe("");
    list.skipTo(1);
    expect(FakeAudio.made[0]!.src).toBe("/b.m4a");
  });

  it("keeps the slot playing when one is added before it", () => {
    const list = createPlaylist(["/b.m4a", "/c.m4a"], () => {});
    list.play();
    list.insert("/a.m4a", 0);
    expect(list.index).toBe(1);
    expect(FakeAudio.made[0]!.src).toBe("/b.m4a");
    list.remove(2);
    FakeAudio.made[0]!.end();
    expect(list.status()).toMatchObject({ index: 1, finished: true });
  });

  it("shows the poem in the Media Session, with previous and next only when there are", () => {
    const list = createPlaylist(["/a.m4a", "/b.m4a"], () => {});
    list.show(NOW, { previous: false, next: true });
    expect(mediaSession.metadata).toMatchObject({
      title: NOW.title,
      artist: NOW.artist,
      album: "شوارد",
      artwork: [{ src: "/artwork.png", sizes: "512x512", type: "image/png" }],
    });
    expect(handlers.get("previoustrack")).toBeNull();
    expect(handlers.get("nexttrack")).toBeTypeOf("function");
    // The next button, a media key or a headset's.
    handlers.get("nexttrack")!({});
    expect(list.index).toBe(1);
    expect(FakeAudio.made[0]!.played).toEqual(["/b.m4a"]);
    expect(mediaSession.playbackState).toBe("playing");
    expect(mediaSession.position).toEqual({ duration: 30, position: 0, playbackRate: 1 });
    // The lock screen's scrubber, and its pause.
    handlers.get("seekto")!({ seekTime: 12 });
    expect(list.time).toBe(12);
    handlers.get("pause")!({});
    expect(list.playing).toBe(false);
    expect(mediaSession.playbackState).toBe("paused");
  });

  it("clears the Media Session when it's released", () => {
    const list = createPlaylist(["/a.m4a"], () => {});
    list.show(NOW, { previous: false, next: false });
    list.play();
    list.release();
    expect(FakeAudio.made[0]!.paused).toBe(true);
    expect(mediaSession.metadata).toBeNull();
    expect(mediaSession.playbackState).toBe("none");
    expect(handlers.get("play")).toBeNull();
  });
});
