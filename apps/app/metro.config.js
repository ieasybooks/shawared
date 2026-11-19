// Expo's Metro config. The web export scripts (package.json's export:web and
// export:web:clean) set SHAWARED_WEB_EXPORT, which gives the export's assets
// plain addresses (plugins/plain-asset-paths.js). The apps' native builds keep
// Expo's asset paths.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
if (process.env.SHAWARED_WEB_EXPORT === "1") {
  config.transformer.assetPlugins = [...(config.transformer.assetPlugins ?? []), require.resolve("./plugins/plain-asset-paths.js")];
}

module.exports = config;
