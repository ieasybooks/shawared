import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

type Asset = { httpServerLocation: string; name: string; files: string[] };
const plainAssetPaths = createRequire(import.meta.url)("./plain-asset-paths.js") as ((asset: Asset) => Asset) & {
  plainPath: (path: string) => string;
};

// The folder Metro gives a font of a package under node_modules/.bun, which
// sits two folders above the app.
const FOLDER = "/assets/../../node_modules/.bun/@expo-google-fonts+amiri@0.4.1/node_modules/@expo-google-fonts/amiri/400Regular";
const PLAIN = "/assets/../../node_modules/.bun/_expo-google-fonts_amiri_0.4.1/node_modules/_expo-google-fonts/amiri/400Regular";
const asset = (httpServerLocation: string): Asset => ({ httpServerLocation, name: "Amiri_400Regular", files: ["/x/Amiri_400Regular.ttf"] });

describe("plainAssetPaths", () => {
  it("makes every character of an exported asset's folder that an address would encode _", () => {
    const exported = asset(`/assets?export_path=${FOLDER}`);
    expect(plainAssetPaths(exported)).toEqual({ ...exported, httpServerLocation: `/assets?export_path=${PLAIN}` });
    // Metro's own record of the asset stays as it was.
    expect(exported.httpServerLocation).toBe(`/assets?export_path=${FOLDER}`);
  });

  it("keeps a plain folder, and the folder up to the export path, as they are", () => {
    const plain = asset("/base/assets?export_path=/base/assets/src/fonts");
    expect(plainAssetPaths(plain)).toEqual(plain);
  });

  it("leaves the dev server's assets alone: it finds each by its path", () => {
    const dev = asset(`/assets/?unstable_path=.${FOLDER.slice("/assets".length)}`);
    expect(plainAssetPaths(dev)).toBe(dev);
  });

  it("plainPath keeps only characters an address takes as they are", () => {
    expect(plainAssetPaths.plainPath("a/@b+c [d]%e~f-g_h.i")).toBe("a/_b_c__d__e~f-g_h.i");
  });
});
