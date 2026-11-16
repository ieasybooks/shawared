import { parseWordAddress, type PublishedSource, type PublishedWordNote } from "@shawared/contracts";

export type WordHit = { source: string; address: string; note: PublishedWordNote; from: number; to: number };

/** "n.h.w" for one word of one half. */
export const wordKey = (n: number, half: 1 | 2, word: number) => `${n}.${half}.${word}`;

/**
 * Which notes cover which word. A phrase note (17.1.2-3) covers each of its words.
 * Sources earlier in the list win, so put the reader's chosen source first.
 */
export function wordIndex(sources: readonly PublishedSource[]): Map<string, WordHit> {
  const index = new Map<string, WordHit>();
  for (const s of sources) {
    for (const [address, note] of Object.entries(s.words)) {
      const a = parseWordAddress(address);
      if (!a) continue;
      for (let w = a.from; w <= a.to; w++) {
        const key = wordKey(a.n, a.half, w);
        if (!index.has(key)) index.set(key, { source: s.id, address, note, from: a.from, to: a.to });
      }
    }
  }
  return index;
}

/** The notes of one bayt, in reading order, each listed once. */
export function notesOfBayt(index: Map<string, WordHit>, n: number): WordHit[] {
  const seen = new Set<string>();
  const out: WordHit[] = [];
  for (const [key, hit] of index) {
    if (!key.startsWith(`${n}.`) || seen.has(hit.address)) continue;
    seen.add(hit.address);
    out.push(hit);
  }
  return out.sort((a, b) => {
    const pa = parseWordAddress(a.address)!;
    const pb = parseWordAddress(b.address)!;
    return pa.half - pb.half || pa.from - pb.from;
  });
}
