// Draws the native apps' icons and splash images in apps/app/assets/app, and
// the artwork lock screens show with a recitation in apps/app/public, from
// Shawared's mark (@shawared/design), the one apps/app/public/favicon.svg
// shows, in the day and night palettes. Run it after changing the mark or its
// colors, and commit what it writes. It needs rsvg-convert (brew install
// librsvg).
//
//   bun scripts/app-icons.ts
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mark, palettes } from "@shawared/design";
import { root } from "./repository.ts";

export const DAY = { paper: palettes.day.bg, ink: palettes.day.fg, dot: palettes.day.accent };
export const NIGHT = { paper: palettes.night.bg, ink: palettes.night.fg, dot: palettes.night.accent };

type Colors = { ink: string; dot: string };

function drawMark({ ink, dot }: Colors, x: number, y: number, size: number): string {
  const dots = mark.dots.map((points) => `<polygon fill="${dot}" points="${points}"/>`).join("");
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${mark.viewBox}"><path d="${mark.stroke}" fill="none" stroke="${ink}" stroke-width="${mark.strokeWidth}" stroke-linecap="square" stroke-linejoin="miter"/>${dots}</svg>`;
}

// A square image of `side` pixels with the mark's square at `share` of it,
// centered, on `paper` or a transparent background.
export function image(side: number, share: number, colors: Colors, paper?: string): string {
  const size = side * share;
  const at = (side - size) / 2;
  const background = paper ? `<rect width="${side}" height="${side}" fill="${paper}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}">${background}${drawMark(colors, at, at, size)}</svg>`;
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

// What the site serves next to the app: the picture of a recitation on lock
// screens, in media notifications and in the browser's media controls (the
// app's ARTWORK_URL), opaque, as they show it on a square of its own.
export const PUBLIC: Record<string, string> = {
  "artwork.png": image(512, 0.6, DAY, DAY.paper),
};

if (import.meta.main) {
  const work = mkdtempSync(join(tmpdir(), "app-icons-"));
  try {
    for (const [dir, images] of [
      ["apps/app/assets/app", ICONS],
      ["apps/app/public", PUBLIC],
    ] as const) {
      const out = join(root(), dir);
      mkdirSync(out, { recursive: true });
      for (const [name, svg] of Object.entries(images)) {
        const source = join(work, `${name}.svg`);
        writeFileSync(source, svg);
        execFileSync("rsvg-convert", ["--format=png", "--output", join(out, name), source]);
      }
      console.log(`${Object.keys(images).join(", ")} in ${out}`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
