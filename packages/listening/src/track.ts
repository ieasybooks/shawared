// Pure functions over plain data; no clocks, no React.
import { parseLineAddress, type Half } from "@shawared/contracts";

export type TrackLine = {
  address: string;
  n: number;
  /** null when the timeline times the whole bayt at once. */
  half: Half | null;
  start: number;
  end: number;
  segment: number;
};

/** Consecutive lines of one bayt, in audio order. A repeated bayt makes a second segment. */
export type Segment = { n: number; start: number; end: number; first: number; last: number };

export type Track = { lines: TrackLine[]; segments: Segment[]; duration: number };

/** Seek this far before a line starts so its first sound isn't clipped. */
export const PRE_ROLL = 0.12;
/** Within this long after a bayt starts, "previous" goes to the bayt before; later, it restarts this one. */
export const RESTART_WINDOW = 1.5;
/** A repeated bayt starts over this long after it ends. */
export const REPEAT_GAP = 0.5;
/** Restart before the recording can end and hand control to the next poem. */
export const REPEAT_END_MARGIN = 0.5;

export const clampTime = (duration: number, seconds: number) => Math.max(0, Math.min(duration - 0.05, seconds));

export function buildTrack(timeline: readonly (readonly [string, number, number])[], duration: number): Track {
  const lines: TrackLine[] = [];
  const segments: Segment[] = [];
  for (const [address, start, end] of timeline) {
    const a = parseLineAddress(address);
    if (!a) continue;
    const prev = segments.at(-1);
    const prevLine = lines.at(-1);
    const sameBayt = prev && prev.n === a.n && prevLine && !(a.half && prevLine.half && a.half <= prevLine.half);
    if (!sameBayt) segments.push({ n: a.n, start, end, first: lines.length, last: lines.length });
    const seg = segments.at(-1)!;
    seg.end = end;
    seg.last = lines.length;
    lines.push({ address, n: a.n, half: a.half ?? null, start, end, segment: segments.length - 1 });
  }
  return { lines, segments, duration };
}

/**
 * The line being recited at time t: the last one that has started. Pauses keep the previous
 * line. -1 before the first. A line counts from its run-up (PRE_ROLL before it starts), so a
 * jump to a line lands on that line, not on the one before it.
 */
export function lineAt(track: Track, t: number): number {
  const { lines } = track;
  let lo = 0;
  let hi = lines.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid]!.start - PRE_ROLL <= t + 0.005) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
}

export function segmentAt(track: Track, t: number): number {
  const i = lineAt(track, t);
  return i < 0 ? -1 : track.lines[i]!.segment;
}

const seekPoint = (s: number) => Math.max(0, s - PRE_ROLL);

/** Where "play from bayt n" goes: its first recitation. */
export function startOfBayt(track: Track, n: number): number | null {
  const seg = track.segments.find((s) => s.n === n);
  return seg ? seekPoint(seg.start) : null;
}

export function nextTarget(track: Track, t: number): number | null {
  const i = segmentAt(track, t);
  const next = track.segments[i + 1];
  return next ? seekPoint(next.start) : null;
}

export function previousTarget(track: Track, t: number): number {
  const i = segmentAt(track, t);
  if (i < 0) return 0;
  const seg = track.segments[i]!;
  if (t - seg.start > RESTART_WINDOW || i === 0) return seekPoint(seg.start);
  return seekPoint(track.segments[i - 1]!.start);
}

/** With repeat on: where to jump back to, or null to keep playing. */
export function repeatTarget(track: Track, segment: number, t: number): number | null {
  const seg = track.segments[segment];
  if (!seg) return null;
  const next = track.segments[segment + 1];
  const gap = next ? Math.min(REPEAT_GAP, Math.max(0, next.start - seg.end - 0.05)) : REPEAT_GAP;
  return t >= Math.min(seg.end + gap, track.duration - REPEAT_END_MARGIN) ? seekPoint(seg.start) : null;
}

/** A late end can arrive before any segment was held; then repeat the final bayt. */
export function repeatStart(track: Track, segment: number): number {
  const seg = track.segments[segment] ?? track.segments.at(-1);
  return seg ? seekPoint(seg.start) : 0;
}
