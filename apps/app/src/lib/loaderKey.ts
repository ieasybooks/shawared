/**
 * The address a page's loader data is filed under, as Expo Router files it: by the route's
 * file, so "/(tabs)/index" is "/", "/en/(tabs)/poets" is "/en/poets", "/poems/x" is itself.
 */
export function addressOf(key: string): string {
  const path = key
    .split("?")[0]!
    .replace(/\/\([^/)]+\)/g, "")
    .replace(/\/index$/, "");
  return path || "/";
}
