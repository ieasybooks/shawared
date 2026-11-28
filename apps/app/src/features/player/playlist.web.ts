// The playlist on the web: one <audio> element that takes each recording in turn, and the Media
// Session, through which phones' lock screens and notifications, and desktops' media keys, show
// and control it. One element for all of them because Safari on iOS lets an element play without
// a tap only once a tap has started it: a new element couldn't start the next poem on a locked
// phone.
import type { Buttons, CreatePlaylist, NowPlaying, Status } from "./types";

/** How often a playing element reports its position (it fires timeupdate about every 250 ms). */
const EVERY = 0.25;
const HAVE_FUTURE_DATA = 3;

const session = () => (typeof navigator !== "undefined" && "mediaSession" in navigator ? navigator.mediaSession : null);

function handle(action: MediaSessionAction, handler: MediaSessionActionHandler | null) {
  try {
    session()?.setActionHandler(action, handler);
  } catch {
    // An action this browser doesn't know.
  }
}

/** Not configured on the web: the browser decides. */
export function configureAudio() {
  return Promise.resolve();
}

export const createPlaylist: CreatePlaylist = (urls, onStatus) => {
  const sources = [...urls];
  let index = 0;
  let finished = false;
  let released = false;
  let lastSent = -1;
  let buttons: Buttons = { previous: false, next: false };
  const media = new Audio();
  media.preload = "auto";
  // The element takes its first recording when it's needed: the player usually skips to a slot
  // after the first before it plays.
  const ensure = () => {
    if (!media.getAttribute("src")) media.src = sources[index] ?? "";
  };

  const status = (): Status => ({
    index,
    time: media.currentTime,
    playing: !media.paused && !media.ended,
    buffering: !media.paused && media.readyState < HAVE_FUTURE_DATA,
    loaded: media.readyState >= 1,
    finished,
  });

  const send = () => {
    if (released) return;
    lastSent = media.currentTime;
    const s = status();
    const ms = session();
    if (ms) {
      ms.playbackState = s.playing ? "playing" : "paused";
      if (Number.isFinite(media.duration) && media.duration > 0) {
        try {
          ms.setPositionState({
            duration: media.duration,
            position: Math.min(media.currentTime, media.duration),
            playbackRate: media.playbackRate || 1,
          });
        } catch {}
      }
    }
    onStatus(s);
  };

  const start = () => {
    finished = false;
    ensure();
    media.play().catch((e: unknown) => {
      // A newer load or a pause cut it short; anything else (the browser wants a tap) stops it.
      if ((e as { name?: string } | null)?.name !== "AbortError") send();
    });
  };

  /** Loads a slot's recording, playing on if the last one was playing or ended into it. */
  const load = (slot: number, play: boolean) => {
    index = slot;
    finished = false;
    media.src = sources[slot] ?? "";
    if (play) start();
    send();
  };

  media.addEventListener("timeupdate", () => {
    if (Math.abs(media.currentTime - lastSent) >= EVERY) send();
  });
  for (const event of ["play", "seeked", "loadedmetadata", "loadeddata", "waiting", "playing", "canplay", "error"]) {
    media.addEventListener(event, send);
  }
  // An element pauses as it ends, just before it says so: the next recording takes over then.
  media.addEventListener("pause", () => {
    if (!media.ended) send();
  });
  media.addEventListener("ended", () => {
    if (index + 1 < sources.length) return load(index + 1, true);
    finished = true;
    send();
  });

  const step = (by: number) => {
    const to = index + by;
    if (to >= 0 && to < sources.length) load(to, true);
  };

  const showButtons = () => {
    handle("previoustrack", buttons.previous ? () => step(-1) : null);
    handle("nexttrack", buttons.next ? () => step(1) : null);
  };

  return {
    get index() {
      return index;
    },
    get time() {
      return media.currentTime;
    },
    get playing() {
      return !media.paused && !media.ended;
    },
    status,
    play: start,
    pause: () => media.pause(),
    seek(seconds) {
      ensure();
      media.currentTime = seconds;
    },
    skipTo: (slot) => load(slot, !media.paused && !media.ended),
    add(url) {
      sources.push(url);
    },
    insert(url, slot) {
      sources.splice(slot, 0, url);
      if (slot <= index) index++;
    },
    remove(slot) {
      if (slot === index) return;
      sources.splice(slot, 1);
      if (slot < index) index--;
    },
    seamlessInsert: true,
    setMuted(muted) {
      media.muted = muted;
    },
    show(now: NowPlaying, next: Buttons) {
      buttons = next;
      const ms = session();
      if (!ms) return;
      if (typeof MediaMetadata !== "undefined") {
        ms.metadata = new MediaMetadata({
          title: now.title,
          artist: now.artist,
          album: now.album,
          artwork: [{ src: now.artwork, sizes: "512x512", type: "image/png" }],
        });
      }
      handle("play", () => start());
      handle("pause", () => media.pause());
      handle("seekto", (d) => {
        if (d.seekTime == null) return;
        if (d.fastSeek && typeof media.fastSeek === "function") media.fastSeek(d.seekTime);
        else media.currentTime = d.seekTime;
      });
      showButtons();
      send();
    },
    release() {
      released = true;
      media.pause();
      media.removeAttribute("src");
      media.load();
      const ms = session();
      if (!ms) return;
      ms.metadata = null;
      ms.playbackState = "none";
      for (const action of ["play", "pause", "seekto", "previoustrack", "nexttrack"] as const) handle(action, null);
    },
  };
};
