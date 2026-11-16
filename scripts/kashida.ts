// Every half of a poem set to one width, the width of its longest half (its "measure"),
// as printed diwans do. Each shorter half grows in three steps: its spaces up to twice their
// width, then long kashidas at the best joins, then its spaces again for whatever is left.
//
// Where kashida may go follows Raqim's Naskh rules (Khaled Hosny), through the analyzer in
// ar-justify. Joins where the font draws a letter differently once stretched come after the
// others. Widths are measured with HarfBuzz in the verse font the app ships (Amiri), in em,
// so one plan serves every size. The app inserts the tatweels and spreads the words across
// the measure; the published text itself never changes.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { withKashida as insertKashida } from "@shawared/contracts";
import * as hb from "harfbuzzjs";

const TATWEEL = "ـ";
const require = createRequire(import.meta.url);

// The analyzer is a plain module next to ar-justify's entry (the package exports only its DOM layer).
type RawPoint = { offset: number; priority: number };
const raqim = (await import(join(dirname(require.resolve("ar-justify")), "raqim.js"))) as {
  builtinPatternSet(name: string): unknown;
  findKashidaPoints(text: string, patterns: unknown): RawPoint[];
};
const naskh = raqim.builtinPatternSet("naskh");

const appRequire = createRequire(join(import.meta.dirname, "..", "apps", "app", "package.json"));
const fontFile = appRequire.resolve("@expo-google-fonts/amiri/400Regular/Amiri_400Regular.ttf");
const face = new hb.Face(new hb.Blob(readFileSync(fontFile)));
const font = new hb.Font(face);

function shape(text: string): { gids: number[]; width: number } {
  const buf = new hb.Buffer();
  buf.addText(text);
  buf.guessSegmentProperties();
  hb.shape(font, buf);
  const gids = buf.getGlyphInfos().map((g) => g.codepoint);
  const width = buf.getGlyphPositions().reduce((s, p) => s + p.xAdvance, 0) / face.upem;
  return { gids, width };
}

const tatweel = shape(TATWEEL);
const TATWEEL_EM = tatweel.width;
const SPACE_EM = shape(" ").width;

/** How far each half may stretch. */
const LIMITS = {
  /** Kashida in one half, at most (em). */
  maxEm: 3,
  /** Tatweels at one join, at most: one long kashida rather than many short ones. */
  perJoin: 6,
};

type Join = { offset: number; priority: number; word: number; reshaped: boolean; firstEm: number };

/** The joins the rules allow, each with what its first tatweel adds (more add a tatweel each). */
function joins(text: string, natural: { gids: number[]; width: number }): Join[] {
  const plain = natural.gids.join(",");
  return raqim.findKashidaPoints(text, naskh).map((p) => {
    const once = shape(insertKashida(text, [[p.offset, 1]]));
    const reshaped = once.gids.filter((g) => g !== tatweel.gids[0]).join(",") !== plain;
    return { ...p, word: text.slice(0, p.offset).split(" ").length - 1, reshaped, firstEm: once.width - natural.width };
  });
}

export type HalfPlan = {
  /** [offset in the half, tatweels], in order. */
  kashida: [number, number][];
  natural: number;
  /** With its kashida, before the spaces grow. */
  width: number;
  spaces: number;
  /** How wide each space ends up, in normal spaces (1 = unchanged). */
  spaceScale: number;
};

/** One half at `measure` em. */
export function planHalf(text: string, measure: number): HalfPlan {
  const natural = shape(text);
  const spaces = text.split(" ").length - 1;
  // Spaces first take up to one more space's width each; kashida aims for the rest.
  const goal = natural.width + Math.max(0, measure - natural.width - spaces * SPACE_EM);
  const plan = new Map<number, number>();
  let width = natural.width;
  if (goal - width >= TATWEEL_EM / 2) {
    const best = new Map<number, Join>();
    for (const j of joins(text, natural)) {
      const c = best.get(j.word);
      const better =
        !c ||
        (c.reshaped && !j.reshaped) ||
        (c.reshaped === j.reshaped && (j.priority > c.priority || (j.priority === c.priority && j.offset > c.offset)));
      if (better) best.set(j.word, j);
    }
    const order = [...best.values()].sort(
      (a, b) => Number(a.reshaped) - Number(b.reshaped) || b.priority - a.priority || b.offset - a.offset,
    );
    fill: for (const j of order) {
      for (let i = 0; i < LIMITS.perJoin; i++) {
        if (goal - width < TATWEEL_EM / 2) break fill;
        const add = i === 0 ? j.firstEm : TATWEEL_EM;
        if (width + add > measure + 0.01 || width + add - natural.width > LIMITS.maxEm + 0.01) break;
        plan.set(j.offset, i + 1);
        width += add;
      }
    }
    // Widths of different words add up; check the whole half once, and shorten the longest
    // kashida if it ran over.
    for (;;) {
      width = shape(insertKashida(text, [...plan])).width;
      if (width <= measure + 0.01 || plan.size === 0) break;
      const [offset, count] = [...plan].sort((x, y) => y[1] - x[1])[0]!;
      if (count > 1) plan.set(offset, count - 1);
      else plan.delete(offset);
    }
  }
  return {
    kashida: [...plan].sort((a, b) => a[0] - b[0]),
    natural: natural.width,
    width,
    spaces,
    spaceScale: spaces ? 1 + (measure - width) / (spaces * SPACE_EM) : 1,
  };
}

export type PoemPlan = {
  /** Every half's width, in em: the longest half's. */
  measure: number;
  /** By line address ("7.1"): the half's kashida. Halves without any are left out. */
  kashida: Record<string, [number, number][]>;
  /** Halves whose spaces more than double, for a look before publishing. */
  wide: { address: string; spaceScale: number }[];
};

/** Every half of a poem at one measure. */
export function planPoem(abyat: readonly { n: number; sadr: string; ajuz: string }[]): PoemPlan {
  const measure = Math.max(...abyat.flatMap((b) => [shape(b.sadr).width, shape(b.ajuz).width]));
  const kashida: PoemPlan["kashida"] = {};
  const wide: PoemPlan["wide"] = [];
  for (const b of abyat)
    for (const [h, text] of [
      [1, b.sadr],
      [2, b.ajuz],
    ] as const) {
      const p = planHalf(text, measure);
      const address = `${b.n}.${h}`;
      if (p.kashida.length) kashida[address] = p.kashida;
      if (p.spaceScale > 2.05) wide.push({ address, spaceScale: p.spaceScale });
    }
  return { measure: Math.round(measure * 1000) / 1000, kashida, wide };
}
