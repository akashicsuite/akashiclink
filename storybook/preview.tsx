/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import '../src/theme/variables.css';
import '../src/theme/font.css';
import '../src/theme/common.scss';

import {
  mockGetExchangeRates,
  mockGetManifest,
  mockGetMinigate,
  mockGetMinigateNftImage,
  mockPostToAC,
} from '@helium-pay/api-mocks';
import { setupIonicReact } from '@ionic/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { useI18next } from './providers/useI18next';
import { useIonMemoryRouter } from './providers/useIonMemoryRouter';
import { useReduxProvider } from './providers/useReduxProvider';
import { useTheme } from './providers/useTheme';

/** Must set up here to allow Ionic components to render */
setupIonicReact();

/** Setup mock service worker */
initialize({
  onUnhandledRequest: ({ method, url }) => {
    const pathname = new URL(url).pathname;
    if (pathname.startsWith('/api')) {
      console.error(`Unhandled ${method} request to ${url}.

        This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.

        If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
      `);
    }
  },
});

const preview: Preview = {
  parameters: {
    msw: {
      handlers: {
        exchangeRate: mockGetExchangeRates,
        manifest: mockGetManifest,
        minigateNftImage: mockGetMinigateNftImage,
        minigate: mockGetMinigate,
        akashicChainPost: mockPostToAC,
      },
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: { values: [] },
    layout: 'centered',
    viewport: {
      defaultViewport: 'extension',
      viewports: {
        extension: {
          name: 'Extension',
          styles: {
            width: '360px',
            height: '600px',
          },
        },
        popup: {
          name: 'Extension Popup',
          styles: {
            width: '360px',
            height: '720px',
          },
        },
        iphone6: INITIAL_VIEWPORTS.iphone6,
        iphonex: INITIAL_VIEWPORTS.iphonex,
        iphonexr: INITIAL_VIEWPORTS.iphonexr,
        ipad: INITIAL_VIEWPORTS.ipad,
        ipad10p: INITIAL_VIEWPORTS.ipad10p,
        ipad12p: INITIAL_VIEWPORTS.ipad12p,
        pixel: INITIAL_VIEWPORTS.pixel,
      },
    },
  },
  /**
   * Create a global variable called locale in storybook
   * and add a menu in the toolbar to change locale
   */
  globalTypes: {
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en-US',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en-US', title: 'English' },
          { value: 'zh-CN', title: '中文（简体）' },
          { value: 'zh-TW', title: '中文（繁體）' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        items: [
          { value: 'light', title: '☀ Light' },
          { value: 'dark', title: '☾ Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [useI18next, useTheme, useIonMemoryRouter, useReduxProvider],
  loaders: [mswLoader],
};

export default preview;
