const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// TypeScript ve diğer dosya tiplerini ekleyelim
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  'mjs'
];

// Bazı klasörleri yoksay
config.watchFolders = [__dirname];
config.resolver.blockList = [
  /node_modules[/\\]@react-navigation[/\\]native[/\\]lib[/\\]typescript[/\\]module[/\\]src/,
];

module.exports = config; 