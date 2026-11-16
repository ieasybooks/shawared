// Addresses point into a poem's Arabic text. Every other layer (translations,
// word meanings, audio timings) is pinned to the Arabic by address.

/** `17` (bayt), `17.1` / `17.2` (sadr / ajuz). Used by the timeline. */
export const LINE_RE = /^([1-9]\d*)(?:\.([12]))?$/;
/** `17.1.5` (5th word of the sadr) or `17.1.2-3` (words 2 to 3). Used by word notes. */
export const WORD_RE = /^([1-9]\d*)\.([12])\.([1-9]\d*)(?:-([1-9]\d*))?$/;

export type Half = 1 | 2;
export type WordAddress = { n: number; half: Half; from: number; to: number };
export type LineAddress = { n: number; half?: Half };

export function parseWordAddress(address: string): WordAddress | null {
  const m = WORD_RE.exec(address);
  if (!m) return null;
  const from = Number(m[3]);
  return { n: Number(m[1]), half: Number(m[2]) as Half, from, to: m[4] ? Number(m[4]) : from };
}

export function parseLineAddress(address: string): LineAddress | null {
  const m = LINE_RE.exec(address);
  if (!m) return null;
  return m[2] ? { n: Number(m[1]), half: Number(m[2]) as Half } : { n: Number(m[1]) };
}

/** The words of a half-verse, as addressed: split on spaces, counted from 1. */
export const wordsOf = (half: string): string[] => half.split(" ");
