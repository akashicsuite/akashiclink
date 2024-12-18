const path = require('path');
const { getLoader, loaderByName } = require('@craco/craco');

module.exports = {
  /**
   * This configuration is here because of a long standing bug
   * in create-react-app (from which we use react-scripts build/start)
   * that prevents babel from resolving modules outside this directory:
   * - https://github.com/facebook/create-react-app/issues/8987
   * - https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/540#issuecomment-1185241955
   *
   * The webpack config needs to have the babel transpiler config extended
   * to include the required monorepo packages (e.g. backend, common-i18n etc)
   *
   * @param webpackConfig to be extended
   * @param dirname_caller should be set to __dirname in the caller. It will be used to correctly evaluate the relative paths of the packages
   * @param storybook specific configuration
   */
  run(webpackConfig, dirname_caller, storybook = false) {
    const resolvePackagePath = (package_path) =>
      path.join(
        dirname_caller,
        path.relative(dirname_caller, __dirname),
        package_path
      );

    // Grab the babel-loader
    const { isFound, match } = getLoader(
      webpackConfig,
      loaderByName('babel-loader')
    );

    if (isFound) {
      // Add additional folders that are not processed by babel by default
      const include = Array.isArray(match.loader.include)
        ? match.loader.include
        : [match.loader.include];

      // Hook on the packages here!
      match.loader.include = include.concat([
        resolvePackagePath('../backend/src'),
        resolvePackagePath('../../packages/common-i18n/src'),
        resolvePackagePath('../../packages/ui-lib/src'),
        resolvePackagePath('../../packages/api-mocks/src'),
      ]);
    }

    // Inject loader for processing ts
    match.loader.options.presets = [
      ...match.loader.options.presets,
      '@babel/preset-typescript',
    ];

    if (storybook) {
      // Fix to multiple copies of react
      // https://github.com/storybookjs/storybook/issues/23295#issuecomment-1629918584
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        react: path.resolve(resolvePackagePath('../../node_modules/react')),
      };
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        constants: require.resolve('constants-browserify'),
        util: require.resolve('util/'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        url: require.resolve('url/'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert/'),
        buffer: require.resolve('buffer/'),
        fs: false,
      };
    }

    return webpackConfig;
  },
};
