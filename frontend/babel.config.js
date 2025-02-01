module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json'
        ],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/theme': './src/theme',
          '@/redux': './src/redux',
          '@/types': './src/types',
          '@/utils': './src/utils',
          '@/api': './src/api',
          '@/config': './src/config'
        }
      }]
    ]
  };
}; 