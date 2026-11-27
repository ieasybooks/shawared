import { ERA_IDS, ERAS, type CatalogPerson, type Era } from "@shawared/contracts";

export function eraOf(person: CatalogPerson): Era {
  return person.era && Object.hasOwn(ERAS, person.era) ? (person.era as Era) : "uncertain";
}

export type EraGroup = { id: Era; count: number };

export function groupPoetsByEra(poets: Record<string, CatalogPerson>): EraGroup[] {
  const people = Object.values(poets);
  if (!people.some((p) => p.era)) return []; // Catalogues published before era filtering.
  const counts = new Map<Era, number>();
  for (const poet of people) {
    const era = eraOf(poet);
    counts.set(era, (counts.get(era) ?? 0) + 1);
  }
  return ERA_IDS.filter((id) => counts.has(id)).map((id) => ({ id, count: counts.get(id)! }));
}
