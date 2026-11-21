// shawared.com's links open the apps at the same page: Apple's and Android's files under
// /.well-known (apps/app/public) name the apps and the paths they take, and app.json gives
// the apps the domain (iOS) and a verified filter for the same paths (Android).
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const app = join(import.meta.dirname, "../apps/app");
const read = (path: string) => readFileSync(join(app, path), "utf8");
const expo = JSON.parse(read("app.json")).expo;
const aasa = JSON.parse(read("public/.well-known/apple-app-site-association"));
const assetlinks = JSON.parse(read("public/.well-known/assetlinks.json"));

// Pages that stay on the web: the four the stores link, and playlists, which live on the
// device that made them.
const WEB_ONLY = ["/about", "/privacy", "/terms", "/support", "/playlist"].flatMap((p) => [p, `/en${p}`]);

/** The app's routes as Apple's patterns: (tabs) and index drop out, [id] is "*". */
function routes(): string[] {
  const dir = join(app, "src/app");
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".tsx") && !/(^|[/\\])[_+]/.test(f))
    .map((f) => {
      const parts = relative(dir, join(dir, f.replace(/\.tsx$/, "")))
        .split(sep)
        .filter((p) => !/^\(.*\)$/.test(p) && p !== "index")
        .map((p) => (/^\[.+\]$/.test(p) ? "*" : p));
      return `/${parts.join("/")}`;
    })
    .sort();
}

const applePaths: string[] = aasa.applinks.details[0].components.map((c: { "/": string }) => c["/"]);
const filter = expo.android.intentFilters[0];
const androidPaths: string[] = filter.data.flatMap((d: { path?: string; pathPrefix?: string }) =>
  d.path ? [d.path] : d.pathPrefix ? [`${d.pathPrefix}*`] : [],
);

describe("the app links", () => {
  it("claim every page the apps have, and only those", () => {
    expect([...applePaths].sort()).toEqual(routes().filter((r) => !WEB_ONLY.includes(r)));
    for (const page of WEB_ONLY) expect(routes(), page).toContain(page);
  });

  it("give iOS and Android the same paths", () => {
    expect(androidPaths).toEqual(applePaths);
  });

  it("name the iOS app and the domain it takes", () => {
    expect(aasa.applinks.details[0].appIDs).toEqual([`${expo.ios.appleTeamId}.${expo.ios.bundleIdentifier}`]);
    expect(expo.ios.associatedDomains).toEqual(["applinks:shawared.com"]);
  });

  it("verify Android's filter against the keys the stores' copies are signed with", () => {
    expect(filter).toMatchObject({ action: "VIEW", autoVerify: true, category: ["BROWSABLE", "DEFAULT"] });
    expect(filter.data[0]).toEqual({ scheme: "https", host: "shawared.com" });
    const [link] = assetlinks;
    expect(assetlinks).toHaveLength(1);
    expect(link.relation).toEqual(["delegate_permission/common.handle_all_urls"]);
    expect(link.target.package_name).toBe(expo.android.package);
    // Google Play's app signing key, and the upload key the AppGallery APK is signed with,
    // which the release checks the builds against.
    const workflow = readFileSync(join(import.meta.dirname, "../.github/workflows/release.yml"), "utf8");
    const upload = /SHA256: ([0-9A-F:]{95})/.exec(workflow)![1];
    expect(link.target.sha256_cert_fingerprints).toHaveLength(2);
    expect(link.target.sha256_cert_fingerprints).toContain(upload);
    for (const print of link.target.sha256_cert_fingerprints) expect(print).toMatch(/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
  });
});
