import { CatalogPoem, source } from "@shawared/contracts";
import { describe, expect, it } from "vitest";
import { meterName, METER_FEET } from "./i18n";

describe("meter compatibility", () => {
  it("keeps the known meter's names and feet while leaving unknown published names readable", () => {
    expect(meterName("mutaqarib", "ar")).toBe("المتقارب");
    expect(meterName("mutaqarib", "en")).toBe("al-Mutaqārib");
    expect(METER_FEET.mutaqarib).toBe("فَعولُنْ فَعولُنْ فَعولُنْ فَعولُنْ");
    expect(meterName("future-meter", "en")).toBe("future-meter");
  });

  it("validates authored meters strictly and keeps the published format lenient", () => {
    const authored = {
      id: "sample",
      poet: "poet",
      title: "قصيدة",
      meter: "tawil",
      themes: ["ritha"],
      added: "2026-11-16",
      abyat_in_full: 1,
      abyat: [{ n: 1, sadr: "صدر", ajuz: "عجز" }],
    };
    expect(source.Poem.safeParse(authored).success).toBe(true);
    expect(source.Poem.safeParse({ ...authored, meter: "future-meter" }).success).toBe(false);
    const published = CatalogPoem.parse({ ...authored, meter: "future-meter", abyat: 1, opening: authored.abyat[0], hash: "v1" });
    expect(published.meter).toBe("future-meter");
  });
});
