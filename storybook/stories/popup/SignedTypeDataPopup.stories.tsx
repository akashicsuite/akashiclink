import {
  mockGetOwnerDetails,
  mockGetOwnerKeys,
  PRESET_L2_ADDRESS,
} from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react';

import { SignTypedDataContent } from '../../../src/popup/sign-typed-data-content';
import type { WalletConnection } from '../../../src/popup/wallet-connection';

const meta: Meta<typeof SignTypedDataContent> = {
  title: 'Popups/SignedTypedData',
  component: SignTypedDataContent,
  parameters: {
    query: {
      appUrl: 'MockApp.app',
    },
    viewport: {
      defaultViewport: 'popup',
    },
    msw: {
      handlers: {
        keys: mockGetOwnerKeys(),
        owner: mockGetOwnerDetails,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WalletConnection>;

export const SignedTypedDataPage: Story = {
  args: {
    requestContent: {
      id: 0,
      method: '',
      topic: '',
      primaryType: '',
      message: {
        identity: PRESET_L2_ADDRESS,
        content: 'I agree to set the following as the callback Urls',
        pendingPayoutCallbackUrl: 'https://callbackurl.com',
      },
      toSign: {},
      secondaryOtk: {},
      response: {},
    },
  },
};

export const SignedTypedDataPageWaiting: Story = {
  args: {
    isWaitingRequestContent: true,
    isProcessingRequest: true,
    requestContent: {
      id: 0,
      method: '',
      topic: '',
      primaryType: '',
      message: {},
      toSign: {},
      secondaryOtk: {},
      response: {},
    },
  },
};
