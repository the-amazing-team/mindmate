const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

module.exports = config; // withNativeWind(config, { input: path.resolve(__dirname, "./global.css") });
