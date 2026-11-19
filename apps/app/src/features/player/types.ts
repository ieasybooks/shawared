// The audio under the player: a list of recordings played one after another, and what the lock
// screen, the media notification or the browser's media controls show of it. playlist.ts is
// expo-audio's on iOS and Android; playlist.web.ts is one <audio> element on the web.

/** A playlist's state, sent whenever it changes and every quarter second while it plays. */
export type Status = {
  /** The slot playing. */
  index: number;
  /** Its position, in seconds. */
  time: number;
  playing: boolean;
  buffering: boolean;
  /** The slot's recording is loaded: it can be sought. */
  loaded: boolean;
  /** The last slot just played to its end. */
  finished: boolean;
};

/** What lock screens, notifications and browsers show of the recitation playing. */
export type NowPlaying = { title: string; artist: string; album: string; artwork: string };

/** Which of the system's previous and next buttons there are. */
export type Buttons = { previous: boolean; next: boolean };

export interface Playlist {
  /** Live: the slot playing now, as the platform has it (a status event can be older). */
  readonly index: number;
  /** Live: the position in the slot playing. */
  readonly time: number;
  /** Live: asked to play and not stopped. */
  readonly playing: boolean;
  /** Live: everything a status says. */
  status(): Status;
  play(): void;
  pause(): void;
  /** Seeks within the slot playing; only once it's loaded. */
  seek(seconds: number): void;
  /** Goes to a slot, paused unless it was playing. */
  skipTo(slot: number): void;
  add(url: string): void;
  insert(url: string, slot: number): void;
  remove(slot: number): void;
  /**
   * Whether a slot inserted before the one playing leaves it be. iOS builds its queue again from
   * the slot playing, which starts it over.
   */
  readonly seamlessInsert: boolean;
  /** Silences the recording without pausing it. */
  setMuted(muted: boolean): void;
  /** Shows what plays on the lock screen, the notification or the browser's media controls. */
  show(now: NowPlaying, buttons: Buttons): void;
  /** Stops, takes the controls off the lock screen, and frees the playlist. */
  release(): void;
}

export type CreatePlaylist = (urls: string[], onStatus: (status: Status) => void) => Playlist;
