module.exports = function (api) {
  api.cache(true);
  const isTest = process.env.NODE_ENV === 'test';
  const plugins = isTest
    ? []
    : [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        [
          'module-resolver',
          {
            root: ['./'],
            // Do not use a bare `@` alias: it becomes regex `^@(/.*|)$` and steals `@/modules/...` before
            // longer keys in some builds. List only explicit prefixes.
            alias: {
              '@/shared': './src/shared',
              '@/modules': './src/modules',
              '@/store': './src/store',
              '@/providers': './src/providers',
              '@/components': './components',
              '@/constants': './constants',
            },
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          },
        ],
      ];
  plugins.push('react-native-reanimated/plugin');
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
