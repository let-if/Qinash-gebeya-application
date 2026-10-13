const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tell Metro to treat .m4a as a static asset instead of code
config.resolver.assetExts.push('m4a');

module.exports = config;