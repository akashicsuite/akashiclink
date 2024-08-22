/**
 * This configuration is here because of a long standing bug
 * in create-react-app (from which we use react-scripts build/start)
 * that prevents babel from resolving modules outside this directory
 *
 * https://github.com/facebook/create-react-app/issues/8987
 * https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/540#issuecomment-1185241955
 */

const { addPlugins } = require('@craco/craco');
const webpack = require('webpack');

const webpackConfigExtender = require('./webpack-config-extender');

module.exports = {
  productionSourceMap: false,
  webpack: {
    configure: (webpackConfig) => {
      // webpack >= 5 does not auto-polyfill core node.js modules. Have to add them like this
      // All used by AL modules (for otk generation, etc.)
      webpackConfig.resolve['fallback'] = {
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

      // For some reason, buffer needs to be added like this too
      addPlugins(webpackConfig, [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ]);

      // resolve issue which import module outside of /src
      // https://github.com/dilanx/craco/issues/345
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) =>
          constructor && constructor.name === 'ModuleScopePlugin'
      );
      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);

      return {
        ...webpackConfigExtender.run(webpackConfig, __dirname),
        ...(process.env.REACT_APP_OPTIMISE === 'false'
          ? {
              optimization: {
                minimize: false,
                runtimeChunk: false,
                splitChunks: {
                  chunks(_) {
                    return false;
                  },
                },
              },
            }
          : {}),
        ignoreWarnings: [
          function ignoreSourcemapsloaderWarnings(warning) {
            return (
              warning.module &&
              warning.module.resource.includes('node_modules') &&
              warning.details &&
              warning.details.includes('source-map-loader')
            );
          },
        ],
      };
    },
  },
};
