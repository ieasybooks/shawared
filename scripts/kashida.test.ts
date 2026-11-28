import { withKashida } from "@shawared/contracts";
import { describe, expect, it } from "vitest";
import { planHalf, planPoem } from "./kashida.ts";

const ABYAT = [
  { n: 1, sadr: "تَقولُ بُثَينَةُ لَمّا رَأَت", ajuz: "فُنوناً مِنَ الشَّعَرِ الأَحمَرِ" },
  { n: 2, sadr: "كَبِرتَ جَميلُ وَأَودى الشَّبابُ", ajuz: "فَقُلتُ بُثَينُ أَلا فَاقصُري" },
  { n: 6, sadr: "وَإِذ أَنا أَغيَدُ غَضُّ الشَّبابِ", ajuz: "أَجُرُّ الرِّداءَ مَعَ المِئزَرِ" },
];
const halves = ABYAT.flatMap((b) => [
  { address: `${b.n}.1`, text: b.sadr },
  { address: `${b.n}.2`, text: b.ajuz },
]);
// Letters that never join the next one: no kashida may follow them.
const RIGHT_JOINING = /[اأإآٱدذرزوؤةء]/;
const MARKS = /[\u064B-\u065F\u0670]/;

describe("withKashida", () => {
  it("inserts tatweels after the given offsets and leaves the text otherwise alone", () => {
    expect(withKashida("لَمّا رَأَت", [[4, 2]])).toBe("لَمّــا رَأَت");
    expect(withKashida("لَمّا", undefined)).toBe("لَمّا");
    expect(withKashida("لَمّا", [])).toBe("لَمّا");
  });
});

describe("planPoem", () => {
  const plan = planPoem(ABYAT);

  it("sets the measure to the longest half and leaves that half as it is", () => {
    const widths = halves.map((h) => planHalf(h.text, plan.measure).natural);
    expect(plan.measure).toBeCloseTo(Math.max(...widths), 2);
    const longest = halves[widths.indexOf(Math.max(...widths))]!;
    expect(plan.kashida[longest.address]).toBeUndefined();
  });

  it("never stretches a half past the measure", () => {
    for (const h of halves) expect(planHalf(h.text, plan.measure).width).toBeLessThanOrEqual(plan.measure + 0.01);
  });

  it("only stretches joins between connecting letters, after their harakat", () => {
    expect(Object.values(plan.kashida).flat().length).toBeGreaterThan(0);
    for (const h of halves)
      for (const [offset, count] of plan.kashida[h.address] ?? []) {
        expect(count).toBeGreaterThan(0);
        let i = offset - 1;
        while (i > 0 && MARKS.test(h.text[i]!)) i--;
        expect(RIGHT_JOINING.test(h.text[i]!), `${h.address} at ${offset}`).toBe(false);
        expect(MARKS.test(h.text[offset] ?? ""), `${h.address}: a haraka left behind at ${offset}`).toBe(false);
        expect(h.text[offset]).not.toBe(" ");
      }
  });

  it("keeps the words where they are: the shown half is the text plus tatweels", () => {
    for (const h of halves) {
      const shown = withKashida(h.text, plan.kashida[h.address]);
      expect(shown.replace(/ـ/g, "")).toBe(h.text);
      expect(shown.split(" ")).toHaveLength(h.text.split(" ").length);
    }
  });

  it("lists the halves that still lean on wide spaces", () => {
    const { wide } = planPoem([{ n: 7, sadr: "دار دار", ajuz: "دار دار دار دار دار دار دار دار" }]);
    expect(wide.map((half) => half.address)).toEqual(["7.1"]);
    expect(wide[0]!.spaceScale).toBeGreaterThan(2);
  });
});
