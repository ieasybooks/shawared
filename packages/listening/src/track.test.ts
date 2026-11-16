import { describe, expect, it } from "vitest";
import { buildTrack, lineAt, nextTarget, previousTarget, PRE_ROLL, repeatTarget, segmentAt, startOfBayt } from "./track.ts";

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
  it("repeat jumps back after the bayt ends", () => {
    const seg = segmentAt(track, 13);
    expect(repeatTarget(track, seg, 13)).toBeNull();
    expect(repeatTarget(track, seg, 14.6)).toBeCloseTo(9 - PRE_ROLL);
  });
});
