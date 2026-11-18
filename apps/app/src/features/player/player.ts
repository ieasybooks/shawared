// The one audio player of the app. It lives outside any screen, so a recitation keeps
// playing while the reader browses, and the mini player and the poem screen both read it.
// Nothing is created until something is played, so it is safe to import while rendering
// pages ahead of time.
//
// It plays a queue: the poems of the list the reader opened the poem from (queue.ts). The
// playlist under it (playlist.ts, playlist.web.ts) holds the poem playing and the ones beside
// it, so the next starts by itself and the lock screen's previous and next buttons work, with
// the app in the background; the player keeps that window filled as it moves.
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PoemBundle, PublishedRecitation } from "@shawared/contracts";
import { buildTrack, PRE_ROLL, REPEAT_GAP, segmentAt, type Track } from "@shawared/listening";
import { AppState } from "react-native";
import { ARTWORK_URL, audioUrl, catalogNow, loadCatalog, loadPoem } from "../../lib/content";
import { t } from "../../lib/i18n";
import { createStore, type Store } from "../../lib/store";
import { createPlaylist } from "./playlist";
import { byline, catalogEntry, queueFor } from "./queue";
import type { Playlist, Status } from "./types";

/** What is playing, with what the mini player and the lock screen show. */
export type NowItem = {
  poemId: string;
  title: string;
  poet: string;
  reciter: string;
  abyat: number;
  /** The language the names are in. */
  lang: string;
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

export type Now = {
  item: NowItem | null;
  track: Track | null;
  /** The poem the queue moved on from, by itself or at the lock screen: its screen follows. */
  from: string | null;
};

export const idleClock = (time = 0): Clock => ({ time, playing: false, ready: false, buffering: false, seq: 0 });

const sameItem = (a: NowItem | null, b: NowItem) => !!a && a.poemId === b.poemId && a.recitation.id === b.recitation.id;

/** A poem's bundle as the player has it: its first recitation, with the names in the bundle's language. */
export function nowItemOf(bundle: PoemBundle, recitation = bundle.recitations[0]): NowItem | null {
  if (!recitation) return null;
  return {
    poemId: bundle.poem.id,
    title: bundle.poem.title,
    poet: bundle.poet.name,
    reciter: bundle.reciters[recitation.reciter]?.name ?? recitation.reciter,
    abyat: bundle.poem.abyat.length,
    lang: bundle.lang,
    recitation,
  };
}

/**
 * Whether a status update leaves the recitation playing. A recording that was asked to play is
 * still playing while it starts or waits for data, though a status then says it isn't: iOS says
 * so while it buffers, and between one poem and the next. Only a pause, an end or an error stops
 * it, by the app, the lock screen or the system.
 */
export function stillPlaying(
  wasPlaying: boolean,
  s: Pick<Status, "playing" | "buffering" | "finished">,
  live: Pick<Playlist, "playing">,
): boolean {
  return s.playing || (wasPlaying && !s.finished && (s.buffering || live.playing));
}

/** The playlist and where it sits in the queue. */
type Session = {
  list: Playlist;
  /** The queue: poem ids, in the order they play. */
  ids: string[];
  /** The queue index of the playlist's first slot. */
  base: number;
  /** How many slots the playlist has: they hold the queue from `base` on. */
  size: number;
  /** The queue index playing. */
  at: number;
  lang: string;
  catalog: ReturnType<typeof catalogNow>;
  /** Poems whose bundle is here, with their timings. */
  items: Map<string, NowItem>;
  /** The last slot played to its end. */
  finished: boolean;
};

const PREFS_KEY = "shawared.player.v1";
/** A repeated last bayt starts over this long before the recording ends, so the next poem never starts. */
const END_MARGIN = 0.5;

class Player {
  readonly now: Store<Now> = createStore<Now>({ item: null, track: null, from: null });
  readonly clock: Store<Clock> = createStore(idleClock());
  readonly repeat: Store<{ on: boolean }> = createStore<{ on: boolean }>({ on: false });
  /** Whether the next poem plays when one ends. The reader's choice is kept on the device. */
  readonly continuous: Store<{ on: boolean }> = createStore<{ on: boolean }>({ on: true });

  private session: Session | null = null;
  private pendingSeek: number | null = null;
  private frame = 0;
  private lockedSegment = -1;
  private lockedSeq = -1;
  private restored = false;
  private appState: { remove(): void } | null = null;

  isCurrent(item: NowItem) {
    return sameItem(this.now.get().item, item);
  }

  /** Makes `item` the current recitation, at `at` seconds, with the poems around it queued. Does nothing if it already is. */
  load(item: NowItem, at = 0) {
    if (this.isCurrent(item)) return;
    this.release();
    this.restore();
    this.watchAppState();
    const catalog = catalogNow();
    const ids = queueFor(item.poemId, catalog);
    const at0 = Math.max(0, ids.indexOf(item.poemId));
    const s: Session = {
      list: null!,
      ids,
      base: at0,
      size: 1,
      at: at0,
      lang: item.lang,
      catalog,
      items: new Map([[item.poemId, item]]),
      finished: false,
    };
    // The poem with the one before it and, playing on, the one after.
    const first = at0 > 0 ? at0 - 1 : at0;
    const last = this.continuous.get().on && at0 + 1 < ids.length ? at0 + 1 : at0;
    const urls: string[] = [];
    for (let i = first; i <= last; i++) urls.push(this.urlOf(s, i));
    s.base = first;
    s.size = urls.length;
    s.list = createPlaylist(urls, this.onStatus);
    if (at0 > first) s.list.skipTo(at0 - first);
    this.session = s;
    this.pendingSeek = at > 0 ? at : null;
    this.now.set({ item, track: buildTrack(item.recitation.timeline, item.recitation.duration), from: null });
    this.clock.set({ ...idleClock(at), buffering: true, seq: this.clock.get().seq + 1 });
    this.show();
    this.prefetch();
    // Opened before the catalog was here (a poem's page on the web): queue the poems after it once it is.
    if (!catalog) void loadCatalog().then((c) => this.catalogArrived(s, c));
  }

  /** Plays the current recitation, or `item` from `at` seconds. */
  play(item?: NowItem, at?: number) {
    if (item && !this.isCurrent(item)) this.load(item, at ?? 0);
    else if (at !== undefined) this.seek(at);
    const s = this.session;
    const cur = this.now.get().item;
    if (!s || !cur) return;
    if (s.finished) {
      // iOS lets go of the last recording at the end of a queue: load it again. A seek made
      // since waits for it.
      s.finished = false;
      s.list.skipTo(s.at - s.base);
      this.clock.set({ ready: false });
      this.fill(s, false);
      this.show();
    }
    if (this.clock.get().time >= cur.recitation.duration - 0.3) this.seek(0);
    s.list.play();
    this.clock.set({ playing: true });
    this.tick();
  }

  pause() {
    const s = this.session;
    if (!s) return;
    s.list.pause();
    this.clock.set({ playing: false, ...(this.pendingSeek === null ? { time: s.list.time } : {}) });
  }

  toggle() {
    if (this.clock.get().playing) this.pause();
    else this.play();
  }

  seek(seconds: number) {
    const cur = this.now.get().item;
    const s = this.session;
    if (!cur || !s) return;
    const t = Math.max(0, Math.min(cur.recitation.duration - 0.05, seconds));
    this.clock.set({ time: t, seq: this.clock.get().seq + 1 });
    if (!this.clock.get().ready || s.finished) this.pendingSeek = t;
    else s.list.seek(t);
  }

  /** Stops and forgets the recitation: the mini player and the lock-screen controls go away. */
  close() {
    this.release();
    this.now.set({ item: null, track: null, from: null });
    this.clock.set({ ...idleClock(), seq: this.clock.get().seq + 1 });
  }

  /** Plays the next poem when one ends, or stops there. */
  setContinuous(on: boolean, save = true) {
    this.continuous.set({ on });
    if (save) AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ continuous: on })).catch(() => {});
    const s = this.session;
    if (!s) return;
    if (on) this.fill(s, false);
    else
      while (s.size - 1 > s.at - s.base) {
        s.list.remove(s.size - 1);
        s.size--;
      }
    this.show();
  }

  /** Reads the reader's choices kept on the device, once. */
  restore() {
    if (this.restored) return;
    this.restored = true;
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => {
        const on = raw ? (JSON.parse(raw) as { continuous?: unknown }).continuous : undefined;
        if (typeof on === "boolean" && on !== this.continuous.get().on) this.setContinuous(on, false);
      })
      .catch(() => {});
  }

  private readonly onStatus = (st: Status) => {
    const s = this.session;
    if (!s) return;
    // Where the playlist is now. An event can be older than a slot added before the one playing,
    // or than a skip, and then names a slot that has moved.
    const slot = s.list.index;
    const fresh = st.index === slot;
    if (s.base + slot !== s.at && s.ids[s.base + slot]) this.moveTo(s, s.base + slot);
    if (!fresh) return;
    // Finished, until something plays it again (the web plays an ended recording from its start).
    if (st.finished) s.finished = true;
    else if (st.playing) s.finished = false;
    if (st.loaded && this.pendingSeek !== null && !s.finished) {
      s.list.seek(this.pendingSeek);
      this.pendingSeek = null;
    }
    const playing = stillPlaying(this.clock.get().playing, st, s.list);
    const duration = this.now.get().item?.recitation.duration ?? st.time;
    this.clock.set({
      playing,
      ready: st.loaded,
      buffering: st.buffering,
      ...(playing || this.pendingSeek !== null ? {} : { time: st.finished ? duration : st.time }),
    });
    if (playing) {
      // Statuses go on in the background, where frames don't: repeat keeps working there.
      this.sample();
      this.tick();
    }
  };

  /** The queue moved on by itself, or at the lock screen, a headset or the browser's media keys. */
  private moveTo(s: Session, at: number) {
    const from = s.ids[s.at] ?? null;
    s.at = at;
    s.finished = false;
    const id = s.ids[at]!;
    const item = s.items.get(id) ?? (catalogEntry(s.catalog, id, s.lang) as NowItem | null);
    this.pendingSeek = null;
    this.lockedSegment = -1;
    this.now.set({ item, track: item ? buildTrack(item.recitation.timeline, item.recitation.duration) : null, from });
    this.clock.set({ time: 0, ready: false, buffering: true, seq: this.clock.get().seq + 1 });
    // Just started: iOS may start it over to put one before it.
    this.fill(s, true);
    this.show();
    this.prefetch();
  }

  /**
   * Keeps a slot after the one playing while playing on, and, with `before`, one before it.
   * iOS starts the slot playing over to put one before it, so that waits for a poem's start
   * there.
   */
  private fill(s: Session, before: boolean) {
    const slot = s.at - s.base;
    // A finished queue waits to be played again: on iOS a recording added now would start.
    if (this.continuous.get().on && !s.finished && slot === s.size - 1 && s.at + 1 < s.ids.length) {
      s.list.add(this.urlOf(s, s.at + 1));
      s.size++;
    }
    if (before && slot === 0 && s.at > 0) {
      s.list.insert(this.urlOf(s, s.at - 1), 0);
      s.base--;
      s.size++;
    }
  }

  private catalogArrived(s: Session, catalog: ReturnType<typeof catalogNow>) {
    if (this.session !== s || !catalog) return;
    const id = s.ids[s.at]!;
    const ids = queueFor(id, catalog);
    const at = ids.indexOf(id);
    if (at < 0) return;
    // The playlist holds this poem alone: it becomes the queue's slot at `at`.
    s.catalog = catalog;
    s.ids = ids;
    s.at = at;
    s.base = at;
    this.fill(s, s.list.seamlessInsert);
    this.show();
    this.prefetch();
  }

  private urlOf(s: Session, i: number) {
    const id = s.ids[i]!;
    const rec = s.items.get(id)?.recitation ?? catalogEntry(s.catalog, id, s.lang)?.recitation;
    return audioUrl(rec?.audio ?? "");
  }

  /** The lock screen, the notification or the browser's controls: this poem, and the buttons the queue has. */
  private show() {
    const s = this.session;
    const item = this.now.get().item;
    if (!s || !item) return;
    const slot = s.at - s.base;
    const lang = item.lang === "en" ? "en" : "ar";
    s.list.show(
      { title: item.title, artist: byline(item.poet, item.reciter, lang), album: t(lang, "brand"), artwork: ARTWORK_URL },
      { previous: slot > 0, next: slot < s.size - 1 },
    );
  }

  /** Loads the bundles of the poem playing and those beside it, for their timings and names. */
  private prefetch() {
    const s = this.session;
    if (!s) return;
    for (const i of [s.at, s.at - 1, s.at + 1]) {
      const id = s.ids[i];
      if (!id || s.items.has(id)) continue;
      void loadPoem(id, s.lang).then((bundle) => {
        const item = bundle && nowItemOf(bundle);
        if (!item || this.session !== s) return;
        s.items.set(id, item);
        if (s.ids[s.at] !== id) return;
        this.now.set({ item, track: buildTrack(item.recitation.timeline, item.recitation.duration) });
        this.show();
      });
    }
  }

  /** Back in the foreground: catch up with what happened at the lock screen meanwhile. */
  private watchAppState() {
    if (this.appState) return;
    this.appState = AppState.addEventListener("change", (state) => {
      if (state === "active" && this.session) this.onStatus(this.session.list.status());
    });
  }

  /** Reads the position, and loops the bayt when repeat is on. */
  private sample() {
    const s = this.session;
    if (!s || this.pendingSeek !== null) return;
    const time = s.list.time;
    const clock = this.clock.get();
    // A jump the app didn't make (the lock screen's scrubber): repeat aims again.
    this.clock.set({ time, ...(Math.abs(time - clock.time) > 1.5 ? { seq: clock.seq + 1 } : {}) });
    if (this.repeat.get().on) this.loopBayt();
  }

  /** While playing, read the position every frame. */
  private tick() {
    if (this.frame || typeof requestAnimationFrame === "undefined") return;
    const step = () => {
      this.frame = 0;
      if (!this.session || !this.clock.get().playing) return;
      this.sample();
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
    if (time >= Math.min(seg.end + gap, track.duration - END_MARGIN)) {
      this.seek(Math.max(0, seg.start - PRE_ROLL));
      this.lockedSeq = this.clock.get().seq;
    }
  }

  private release() {
    if (this.frame && typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(this.frame);
    this.frame = 0;
    const s = this.session;
    this.session = null;
    s?.list.release();
    this.pendingSeek = null;
    this.lockedSegment = -1;
  }
}

export const player = new Player();
