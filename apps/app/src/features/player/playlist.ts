// The playlist on iOS and Android: expo-audio's AudioPlaylist. The system moves from one recording
// to the next by itself, so a poem follows another with the screen locked, and only a playlist
// gets the lock screen's previous and next buttons (a single player's are always off).
import { createAudioPlaylist, setAudioModeAsync, type AudioMetadata, type AudioPlaylistStatus } from "expo-audio";
import { Platform } from "react-native";
import type { Buttons, CreatePlaylist, Status } from "./types";

let configured: Promise<void> | null = null;

/**
 * The audio session, set once before anything plays: it plays with the ringer off and in the
 * background, and doesn't mix with other apps' audio, which the lock screen's controls need.
 * Persistent: another app that was playing doesn't start again by itself when a poem stops
 * (on Android a call or an alarm still hands the audio back, and a poem goes on after it; iOS
 * says when it should).
 */
export function configureAudio() {
  configured ??= setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: "doNotMixPersistent",
  }).catch(() => {
    configured = null;
  });
  return configured;
}

const statusOf = (s: AudioPlaylistStatus): Status => ({
  index: s.currentIndex,
  time: s.currentTime,
  playing: s.playing,
  buffering: s.isBuffering,
  loaded: s.isLoaded,
  finished: s.didJustFinish,
});

export const createPlaylist: CreatePlaylist = (urls, onStatus) => {
  void configureAudio();
  const list = createAudioPlaylist({ sources: urls.map((uri) => ({ uri })), updateInterval: 250, loop: "none" });
  const sub = list.addListener("playlistStatusUpdate", (s) => onStatus(statusOf(s)));
  let buttons: Buttons | null = null;
  let shown = "";
  return {
    get index() {
      return list.currentIndex;
    },
    get time() {
      return list.currentTime;
    },
    get playing() {
      return list.playing;
    },
    status: () => statusOf(list.currentStatus),
    play: () => list.play(),
    pause: () => list.pause(),
    seek: (seconds) => void list.seekTo(seconds).catch(() => {}),
    skipTo: (slot) => list.skipTo(slot),
    add: (url) => list.add({ uri: url }),
    insert: (url, slot) => list.insert({ uri: url }, slot),
    remove: (slot) => list.remove(slot),
    seamlessInsert: Platform.OS !== "ios",
    setMuted(muted) {
      try {
        list.muted = muted;
      } catch {}
    },
    show(now, next) {
      const metadata: AudioMetadata = { title: now.title, artist: now.artist, albumTitle: now.album, artworkUrl: now.artwork };
      const key = JSON.stringify(metadata);
      try {
        // The buttons are set with the controls. iOS takes new ones at once; Android builds its
        // media session again for them, which could let its playback service out of the
        // foreground in the background, so it keeps the ones the playlist started with.
        const changed = !!buttons && (buttons.previous !== next.previous || buttons.next !== next.next);
        if (!buttons || (changed && Platform.OS === "ios")) {
          buttons = next;
          shown = key;
          list.setActiveForLockScreen(true, metadata, { showPreviousTrack: next.previous, showNextTrack: next.next });
        } else if (key !== shown) {
          shown = key;
          list.updateLockScreenMetadata(metadata);
        }
      } catch {
        // Lock-screen controls are a bonus; playback works without them.
      }
    },
    release() {
      sub.remove();
      try {
        list.pause();
        list.destroy();
      } finally {
        list.release();
      }
    },
  };
};
