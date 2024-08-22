import type { StorybookConfig } from '@storybook/react-webpack5';
import { dirname, join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackConfigExtender = require('../webpack-config-extender');

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: ['./stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: { fastRefresh: true },
  },

  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/preset-create-react-app'),
  ],

  /**
   * Same config override as for craco.config.
   * Ideally of course we would use 'storybook-preset-craco' in addons
   * However the latest build has a conflict in the webpack version that it uses
   */
  webpackFinal: (webpackConfig) =>
    webpackConfigExtender.run(webpackConfig, __dirname, true),

  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },

  staticDirs: ['../public'],
};
export default config;
