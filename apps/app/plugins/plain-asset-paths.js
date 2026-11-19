// A Metro asset plugin, which metro.config.js gives the web export (not an
// Expo config plugin). Expo names the files of packages under
// node_modules/.bun by their folders, with @ and + (@expo-google-fonts+amiri
// @0.4.1), and Cloudflare answers such an address with a redirect to its
// percent-encoded form: a round trip before each font, and text waits for its
// font. This makes each such character of an exported asset's folder _ before
// Metro writes the scripts and pages that name it, so the content hashes in
// the scripts' names cover the addresses they hold.
//
// Only an export's asset carries ?export_path=, the folder Expo writes it to
// and the address the export names. The dev server finds an asset by its
// ?unstable_path=, which stays as it is.
const EXPORT_PATH = "?export_path=";

/** A path with every character an address would have to percent-encode made `_`. */
const plainPath = (path) => path.replace(/[^A-Za-z0-9._~/-]/g, "_");

function plainAssetPaths(asset) {
  const at = asset.httpServerLocation.indexOf(EXPORT_PATH);
  if (at === -1) return asset;
  const prefix = asset.httpServerLocation.slice(0, at + EXPORT_PATH.length);
  return { ...asset, httpServerLocation: prefix + plainPath(asset.httpServerLocation.slice(prefix.length)) };
}

module.exports = plainAssetPaths;
module.exports.plainPath = plainPath;
