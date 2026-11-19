import type { Catalog } from "@shawared/contracts";

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
