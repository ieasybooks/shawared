// Draws the native apps' icons and splash images in apps/app/assets/app from
// Shawared's mark, the one apps/app/public/favicon.svg shows, in its day and
// night colors. Run it after changing the mark or its colors, and commit what
// it writes. It needs rsvg-convert (brew install librsvg).
//
//   bun scripts/app-icons.ts
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { root } from "./recordings.ts";

export const DAY = { paper: "#F3F0E8", ink: "#1A2036", dot: "#B8650C" };
export const NIGHT = { paper: "#131A2E", ink: "#ECE5D3", dot: "#E8A33C" };

type Colors = { ink: string; dot: string };

// The mark in a 104-unit square: the base line with its three stems, and the
// three dots rising over it.
function mark({ ink, dot }: Colors, x: number, y: number, size: number): string {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="7 -3 104 104">
    <path d="M93.5 50V80.5H26V66M73.5 58V80.5M53.5 58V80.5" fill="none" stroke="${ink}" stroke-width="11" stroke-linecap="square" stroke-linejoin="miter"/>
    <polygon fill="${dot}" points="58,30.5 65.5,38 58,45.5 50.5,38"/>
    <polygon fill="${dot}" points="40,20.5 46.5,27 40,33.5 33.5,27"/>
    <polygon fill="${dot}" points="24,11.5 29.5,17 24,22.5 18.5,17"/>
  </svg>`;
}

// A square image of `side` pixels with the mark's square at `share` of it,
// centered, on `paper` or a transparent background.
export function image(side: number, share: number, colors: Colors, paper?: string): string {
  const size = side * share;
  const at = (side - size) / 2;
  const background = paper ? `<rect width="${side}" height="${side}" fill="${paper}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}">${background}${mark(colors, at, at, size)}</svg>`;
}

// The mark takes 72% of an icon, as in the favicon. An Android adaptive icon's
// foreground shows only its middle 61% for certain, in a circle: at 54%, the
// mark's corners stay inside it.
export const ICONS: Record<string, string> = {
  // iOS: the day icon, a night one the system shows on its dark background, and
  // a grey one it tints.
  "icon.png": image(1024, 0.72, DAY, DAY.paper),
  "icon-dark.png": image(1024, 0.72, NIGHT),
  "icon-tinted.png": image(1024, 0.72, { ink: "#FFFFFF", dot: "#A6A6A6" }),
  // Android: the adaptive icon's foreground over DAY.paper, and the shape its
  // themed icon tints.
  "adaptive-foreground.png": image(1024, 0.54, DAY),
  "adaptive-monochrome.png": image(1024, 0.54, { ink: "#FFFFFF", dot: "#FFFFFF" }),
  // The splash screen's mark, by day and by night.
  "splash.png": image(512, 1, DAY),
  "splash-dark.png": image(512, 1, NIGHT),
};

if (import.meta.main) {
  const out = join(root(), "apps/app/assets/app");
  mkdirSync(out, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "app-icons-"));
  try {
    for (const [name, svg] of Object.entries(ICONS)) {
      const source = join(work, `${name}.svg`);
      writeFileSync(source, svg);
      execFileSync("rsvg-convert", ["--format=png", "--output", join(out, name), source]);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  console.log(`app icons: ${Object.keys(ICONS).join(", ")} in ${out}`);
}
