import type { StorybookConfig } from '@storybook/react-webpack5';
import { dirname, join } from 'path';

const webpackConfigExtender = require('../webpack-config-extender');

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: ['./stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  framework: {
    // @ts-ignore
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: { fastRefresh: true },
  },

  addons: [
    getAbsolutePath('@storybook/preset-create-react-app'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-queryparams'),
    getAbsolutePath('@storybook/addon-coverage'),
  ],

  /**
   * Same config override as for craco.config.
   * Ideally of course we would use 'storybook-preset-craco' in addons
   * However the latest build has a conflict in the webpack version that it uses
   */
  webpackFinal: (webpackConfig) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    webpackConfigExtender.run(webpackConfig, __dirname, true),

  docs: {
    defaultName: 'Documentation',
  },

  staticDirs: ['../public'],
};
export default config;
