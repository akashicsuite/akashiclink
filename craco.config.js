/* eslint-disable sonarjs/no-nested-functions */

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
const path = require('path');

const webpackConfigExtender = require('./webpack-config-extender');

module.exports = {
  eslint: {
    enable: false,
  },
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

      // --- Extension-specific configuration (production only) ---
      // These modifications are needed for Chrome extension builds but break HMR in development
      if (process.env.NODE_ENV === 'production') {
        // Add additional extension entry points (background, content, injected)
        // CRA normally provides a single entry (index.tsx). We convert to an object so webpack emits
        // separate bundles we can reference from the extension manifest.
        const originalEntry = webpackConfig.entry;
        const extraEntries = {
          background: path.resolve(__dirname, 'src/background.ts'),
          content: path.resolve(__dirname, 'src/content.ts'),
          injected: path.resolve(__dirname, 'src/injected.ts'),
        };
        if (typeof originalEntry === 'function') {
          webpackConfig.entry = async () => {
            const resolved = await originalEntry();
            return { main: resolved, ...extraEntries };
          };
        } else if (
          Array.isArray(originalEntry) ||
          typeof originalEntry === 'string'
        ) {
          webpackConfig.entry = { main: originalEntry, ...extraEntries };
        } else if (typeof originalEntry === 'object') {
          webpackConfig.entry = { ...originalEntry, ...extraEntries };
        }

        // Deterministic filenames (no content hash) so manifest can reference predictable names
        if (webpackConfig.output) {
          webpackConfig.output.filename = 'static/js/[name].js';
          webpackConfig.output.chunkFilename = 'static/js/[name].chunk.js';
        }

        // Plugin: copy selected entry outputs to build root (needed for MV3 manifest simplicity)
        class CopyEntryRootsPlugin {
          constructor(entryNames) {
            this.entryNames = entryNames;
          }
          apply(compiler) {
            compiler.hooks.thisCompilation.tap(
              'CopyEntryRootsPlugin',
              (compilation) => {
                const { Compilation } = compiler.webpack;
                compilation.hooks.processAssets.tap(
                  {
                    name: 'CopyEntryRootsPlugin',
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                  },
                  (assets) => {
                    this.entryNames.forEach((n) => {
                      const src = `static/js/${n}.js`;
                      if (assets[src]) {
                        compilation.emitAsset(`${n}.js`, assets[src]);
                      }
                    });
                  }
                );
              }
            );
          }
        }
        webpackConfig.plugins.push(
          new CopyEntryRootsPlugin(['background', 'content', 'injected'])
        );

        // Use SourceMapDevToolPlugin so Datadog can directly consume maps with embedded source content.
        webpackConfig.devtool = false;
        webpackConfig.plugins.push(
          new webpack.SourceMapDevToolPlugin({
            noSources: false,
            filename: '[file].map',
          })
        );
      }

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
