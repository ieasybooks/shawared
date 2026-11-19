// Shawared's look: the tokens from the 0.3 identity and 0.4 listening drafts (design/).

export type ThemeName = "day" | "night";

export const palettes = {
  day: {
    bg: "#F3F0E8",
    /** Cards, the player, sheets: a step above the page. */
    raise: "#FBF9F4",
    /** The sidebar, the explanation's verse, chips: a step below the page. */
    fold: "#EAE5D8",
    fg: "#1A2036",
    /** The other half of the playing bayt. */
    partner: "#1A2036",
    /** Verses at rest. */
    rest: "#1A2036",
    muted: "#5A6283",
    /** Saffron: the nuqta and what is active (the half being recited), never body text. */
    accent: "#B8650C",
    /** A wash of saffron behind something picked out. */
    accentSoft: "#F1DFC6",
    line: "#E0D9CB",
    line2: "#CDC5B4",
    chrome: "#E6E1D5",
    shadow: "rgba(26,32,54,0.16)",
    /** Frosted buttons over the girih band. */
    glass: "rgba(255,255,255,0.45)",
    glassLine: "rgba(255,255,255,0.7)",
  },
  night: {
    bg: "#12151F",
    raise: "#1D2231",
    fold: "#181C29",
    fg: "#ECE7DC",
    partner: "#ECE7DC",
    rest: "#ECE7DC",
    muted: "#B3B7C8",
    accent: "#E0A458",
    accentSoft: "#3D2C18",
    line: "#2A3042",
    line2: "#3B4259",
    chrome: "#0D1018",
    shadow: "rgba(0,0,0,0.5)",
    glass: "rgba(255,255,255,0.06)",
    glassLine: "rgba(255,255,255,0.10)",
  },
} as const;

/** The cover tile keeps its night blue and girih in both themes. */
export const tile = { bg: "#1A2036", fg: "#F3F0E8", girih: "#E0A458" } as const;

export type Palette = { [K in keyof (typeof palettes)["day"]]: string };

export { fonts } from "./fonts.ts";

/** Mark A: a square-Kufic shin with three roaming dots. Drawn in viewBox "7 -3 104 104". */
export const mark = {
  viewBox: "7 -3 104 104",
  stroke: "M93.5 50V80.5H26V66M73.5 58V80.5M53.5 58V80.5",
  strokeWidth: 11,
  dots: ["58,30.5 65.5,38 58,45.5 50.5,38", "40,20.5 46.5,27 40,33.5 33.5,27", "24,11.5 29.5,17 24,22.5 18.5,17"],
} as const;

/** Following pauses this long after the reader scrolls (the Faqieh rule). */
export const FOLLOW_RESUME_MS = 5000;

/** Gaps between elements, in px. Text boxes are trimmed to their ink, so these are true visible gaps. */
export const space = { xxs: 2, xs: 4, s: 6, m: 8, l: 12, xl: 16, xxl: 24 } as const;

export * from "./type.ts";
