const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript and other file extensions
config.resolver.sourceExts = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
  'mjs',
  'cjs'
];

// Configure project root and watch folders
config.projectRoot = __dirname;
config.watchFolders = [__dirname];

// Configure resolver
config.resolver.assetExts = ['db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg'];
config.resolver.platforms = ['ios', 'android', 'web'];

// Add root directories for module resolution
config.resolver.nodeModulesPaths = [
  `${__dirname}/node_modules`,
  `${__dirname}/src`,
  `${__dirname}/app`,
  `${__dirname}/components`
];

module.exports = config; 