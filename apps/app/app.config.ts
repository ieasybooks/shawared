import { buildNumber } from "@ieasybooks/release/build-number";
import type { ConfigContext, ExpoConfig } from "expo/config";
import { version } from "./package.json";

// The apps' version is apps/app/package.json's, which release-please raises;
// the build numbers follow from it (1.2.3 builds as 1002003).
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name!,
  slug: config.slug!,
  version,
  ios: { ...config.ios, buildNumber: String(buildNumber(version)) },
  android: { ...config.android, versionCode: buildNumber(version) },
});
