// Shawared's look: the tokens from the 0.3 identity and 0.4 listening drafts (design/).

export type ThemeName = "day" | "night";

export const palettes = {
  day: {
    bg: "#F3F0E8",
    raise: "#FFFDF8",
    fold: "#EAE5D8",
    fg: "#1A2036",
    /** The other half of the playing bayt. */
    partner: "#434A69",
    /** Verses at rest. */
    rest: "#666A7E",
    muted: "#5A6283",
    /** Saffron: the nuqta, never body text. */
    accent: "#B8650C",
    line: "#E0D9CB",
    line2: "#CDC5B4",
    chrome: "#E6E1D5",
    shadow: "rgba(26,32,54,0.16)",
  },
  night: {
    bg: "#131A2E",
    raise: "#1B2440",
    fold: "#212B4A",
    fg: "#ECE5D3",
    partner: "#A9AFC6",
    rest: "#7A83A2",
    muted: "#8F97B2",
    accent: "#E8A33C",
    line: "#27304C",
    line2: "#3A4570",
    chrome: "#0D1322",
    shadow: "rgba(4,6,16,0.5)",
  },
} as const;

export type Palette = { [K in keyof (typeof palettes)["day"]]: string };

/** Font family names as registered by the app's font loader. */
export const fonts = {
  verse: "Amiri_400Regular",
  verseBold: "Amiri_700Bold",
  translation: "Newsreader_400Regular",
  translationItalic: "Newsreader_400Regular_Italic",
  ui: "ReadexPro_400Regular",
  uiLight: "ReadexPro_300Light",
  uiMedium: "ReadexPro_500Medium",
  display: "ReemKufi_600SemiBold",
} as const;

/** Mark A: a square-Kufic shin with three roaming dots. Drawn in viewBox "7 -3 104 104". */
export const mark = {
  viewBox: "7 -3 104 104",
  stroke: "M93.5 50V80.5H26V66M73.5 58V80.5M53.5 58V80.5",
  strokeWidth: 11,
  dots: ["58,30.5 65.5,38 58,45.5 50.5,38", "40,20.5 46.5,27 40,33.5 33.5,27", "24,11.5 29.5,17 24,22.5 18.5,17"],
} as const;

/** Following pauses this long after the reader scrolls (the Faqieh rule). */
export const FOLLOW_RESUME_MS = 5000;
