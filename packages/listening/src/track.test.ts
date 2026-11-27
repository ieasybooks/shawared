import { describe, expect, it } from "vitest";
import {
  buildTrack,
  clampTime,
  lineAt,
  nextTarget,
  previousTarget,
  PRE_ROLL,
  repeatStart,
  repeatTarget,
  segmentAt,
  startOfBayt,
} from "./track.ts";

const timeline: [string, number, number][] = [
  ["1.1", 2, 5],
  ["1.2", 5.5, 8],
  ["2.1", 9, 11],
  ["2.2", 11.5, 14],
  ["2.1", 15, 17], // the reciter repeats the sadr of bayt 2
  ["2.2", 17.5, 20],
  ["3", 21, 26], // a bayt timed as a whole
];
const track = buildTrack(timeline, 30);

describe("buildTrack", () => {
  it("groups consecutive lines of a bayt into segments, splitting repeats", () => {
    expect(track.segments.map((s) => [s.n, s.start, s.end])).toEqual([
      [1, 2, 8],
      [2, 9, 14],
      [2, 15, 20],
      [3, 21, 26],
    ]);
    expect(track.lines[6]).toMatchObject({ n: 3, half: null, segment: 3 });
  });
});

describe("lineAt", () => {
  it("is -1 before the first line", () => expect(lineAt(track, 1)).toBe(-1));
  it("finds the line being recited", () => expect(lineAt(track, 6)).toBe(1));
  it("holds the previous line through a pause", () => expect(lineAt(track, 8.7)).toBe(1));
  it("finds the repeated sadr as its own line", () => expect(lineAt(track, 16)).toBe(4));
  it("stays on the last line after the end", () => expect(lineAt(track, 29)).toBe(6));
  it("counts a line from its run-up, so a jump lands on it", () => {
    expect(lineAt(track, startOfBayt(track, 2)!)).toBe(2);
    expect(segmentAt(track, startOfBayt(track, 2)!)).toBe(1);
    expect(lineAt(track, 9 - PRE_ROLL - 0.05)).toBe(1);
  });
});

describe("navigation", () => {
  it("plays a bayt from its first recitation, a little early", () => {
    expect(startOfBayt(track, 2)).toBeCloseTo(9 - PRE_ROLL);
    expect(startOfBayt(track, 9)).toBeNull();
  });
  it("next goes to the following segment, including a repeat", () => {
    expect(nextTarget(track, 12)).toBeCloseTo(15 - PRE_ROLL);
    expect(nextTarget(track, 25)).toBeNull();
  });
  it("previous restarts the bayt once it is under way, else goes back one", () => {
    expect(previousTarget(track, 13)).toBeCloseTo(9 - PRE_ROLL);
    expect(previousTarget(track, 9.5)).toBeCloseTo(2 - PRE_ROLL);
    expect(previousTarget(track, 0.5)).toBe(0);
  });
  it("after a jump, next and previous move on from the bayt jumped to", () => {
    const at = startOfBayt(track, 2)!;
    expect(nextTarget(track, at)).toBeCloseTo(15 - PRE_ROLL);
    expect(previousTarget(track, at)).toBeCloseTo(2 - PRE_ROLL);
  });
  it("repeat jumps back after the bayt ends", () => {
    const seg = segmentAt(track, 13);
    expect(repeatTarget(track, seg, 13)).toBeNull();
    expect(repeatTarget(track, seg, 14.6)).toBeCloseTo(9 - PRE_ROLL);
  });
  it("repeats before the following bayt when the gap is shorter than half a second", () => {
    const close = buildTrack(
      [
        ["1", 1, 4],
        ["2", 4.2, 8],
      ],
      10,
    );
    expect(repeatTarget(close, 0, 4.1)).toBeNull();
    expect(repeatTarget(close, 0, 4.16)).toBeCloseTo(0.88);
  });
  it("repeats the final bayt before the recording ends and recovers after a late end", () => {
    const ending = buildTrack(
      [
        ["1", 1, 4],
        ["2", 5, 9.9],
      ],
      10,
    );
    expect(repeatTarget(ending, 1, 9.4)).toBeNull();
    expect(repeatTarget(ending, 1, 9.5)).toBeCloseTo(4.88);
    expect(repeatStart(ending, -1)).toBeCloseTo(4.88);
    expect(repeatStart(ending, 0)).toBeCloseTo(0.88);
  });
  it("keeps seeks within a recording without seeking exactly to its end", () => {
    expect(clampTime(30, -5)).toBe(0);
    expect(clampTime(30, 12)).toBe(12);
    expect(clampTime(30, 40)).toBe(29.95);
    expect(clampTime(0, 1)).toBe(0);
  });
});
