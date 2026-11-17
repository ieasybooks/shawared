import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DAY, ICONS, NIGHT } from "./app-icons.ts";

const ASSETS = join(import.meta.dirname, "../apps/app/assets/app");

// A PNG's size and whether it has an alpha channel, from its header.
function png(name: string) {
  const bytes = readFileSync(join(ASSETS, name));
  const colorType = bytes[25]!;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), alpha: colorType === 4 || colorType === 6 };
}

describe("the apps' icons", () => {
  it("are all drawn, at the sizes the stores take", () => {
    for (const name of Object.keys(ICONS)) {
      const side = name.startsWith("splash") ? 512 : 1024;
      expect(png(name), name).toMatchObject({ width: side, height: side });
    }
  });

  it("give iOS an opaque icon, since App Store Connect refuses one with transparency", () => {
    expect(png("icon.png").alpha).toBe(false);
  });

  it("draw the others over the system's own background", () => {
    for (const name of Object.keys(ICONS).filter((n) => n !== "icon.png")) expect(png(name).alpha, name).toBe(true);
  });
});

describe("app.json", () => {
  const expo = JSON.parse(readFileSync(join(import.meta.dirname, "../apps/app/app.json"), "utf8")).expo;
  const splash = expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === "expo-splash-screen")[1];

  it("sets the icons and the splash screen on the palettes' backgrounds", () => {
    expect(expo.android.adaptiveIcon.backgroundColor).toBe(DAY.paper);
    expect(splash.backgroundColor).toBe(DAY.paper);
    expect(splash.dark.backgroundColor).toBe(NIGHT.paper);
  });
});
