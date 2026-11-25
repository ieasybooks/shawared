import type { Catalog } from "@shawared/contracts";

/** Count each performance, including a second recording of the same poem. */
export function recordingsByReciter(poems: Catalog["poems"]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const poem of poems) {
    for (const recording of poem.recitations) counts[recording.reciter] = (counts[recording.reciter] ?? 0) + 1;
  }
  return counts;
}

/** How many poems, poets, reciters and meters (with poems) the library has. */
export type Counts = { poems: number; poets: number; reciters: number; meters: number };

export function countsOf(catalog: Catalog): Counts {
  return {
    poems: catalog.poems.length,
    poets: Object.keys(catalog.poets).length,
    reciters: Object.keys(catalog.reciters).length,
    meters: Object.values(catalog.meters).filter((n) => n > 0).length,
  };
}
