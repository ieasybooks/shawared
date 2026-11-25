// Text boxes trimmed to their ink.
//
// A line box is sized from the ascent and descent a font declares, but Arabic harakat
// and tails reach well past them, and iOS draws text only inside its box. So every text
// style here is built from what the glyphs really cover on our own content (measured
// with HarfBuzz: see docs/typography.md): the outer box of a text runs from the highest
// mark it can have to the lowest tail. Empty line space is removed with negative margins,
// overflow is made room for with padding. Two texts can then only touch if their gap is
// zero, and spacing between elements is exactly the gap the layout asks for.
import { fonts } from "./fonts.ts";

export type Script = "ar" | "latin";
export type Face = keyof typeof fonts;

type Ink = { top: number; bottom: number };
type Metrics = { ascent: number; descent: number; ink: Partial<Record<Script, Ink>> };

/** Per font, in em: declared ascent/descent, and the ink of our text in each script. */
const METRICS: Record<"amiri" | "readex" | "newsreader" | "kufi", Metrics> = {
  amiri: { ascent: 1.124, descent: 0.634, ink: { ar: { top: 1.3, bottom: 0.73 } } },
  readex: { ascent: 1.0, descent: 0.25, ink: { ar: { top: 1.15, bottom: 0.57 }, latin: { top: 0.79, bottom: 0.23 } } },
  newsreader: { ascent: 0.735, descent: 0.265, ink: { latin: { top: 0.72, bottom: 0.26 } } },
  kufi: { ascent: 1.1, descent: 0.4, ink: { ar: { top: 1.02, bottom: 0.22 }, latin: { top: 1.02, bottom: 0.22 } } },
};

const FAMILY: Record<Face, keyof typeof METRICS> = {
  verse: "amiri",
  verseBold: "amiri",
  ui: "readex",
  uiMedium: "readex",
  translation: "newsreader",
  translationItalic: "newsreader",
  display: "kufi",
};

export type TextBox = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  paddingTop: number;
  paddingBottom: number;
  marginTop: number;
  marginBottom: number;
};

/**
 * A text style whose outer box is the text's ink. `spacing` is the distance between
 * wrapped lines as a multiple of the size; it is raised if lines would collide.
 */
export function textBox(face: Face, size: number, script: Script, spacing = 0, inkBounds?: Ink): TextBox {
  const m = METRICS[FAMILY[face]];
  const ink = inkBounds ?? m.ink[script] ?? m.ink.ar ?? m.ink.latin!;
  const lineHeight = Math.max(Math.round(size * spacing), Math.ceil(size * (ink.top + ink.bottom)));
  // Browsers and iOS centre the declared ascent + descent inside the line box.
  const baseline = (lineHeight - size * (m.ascent + m.descent)) / 2 + size * m.ascent;
  const slackTop = baseline - size * ink.top;
  const slackBottom = lineHeight - baseline - size * ink.bottom;
  return {
    fontFamily: fonts[face],
    fontSize: size,
    lineHeight,
    paddingTop: slackTop < 0 ? Math.ceil(-slackTop) : 0,
    paddingBottom: slackBottom < 0 ? Math.ceil(-slackBottom) : 0,
    marginTop: slackTop > 0 ? -Math.floor(slackTop) : 0,
    marginBottom: slackBottom > 0 ? -Math.floor(slackBottom) : 0,
  };
}

/** A single line's ink height, for laying out boxes that must hold one line of text. */
export function inkHeight(face: Face, size: number, script: Script) {
  const m = METRICS[FAMILY[face]];
  const ink = m.ink[script] ?? m.ink.ar ?? m.ink.latin!;
  return Math.ceil(size * (ink.top + ink.bottom));
}
