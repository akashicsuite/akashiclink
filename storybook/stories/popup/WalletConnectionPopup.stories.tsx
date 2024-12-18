import { mockGetOwnerKeys } from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react';

import { WalletConnection } from '../../../src/popup/wallet-connection';

const meta: Meta<typeof WalletConnection> = {
  title: 'Popups',
  component: WalletConnection,
  args: {
    isPopup: true,
  },
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
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WalletConnection>;

export const WalletConnectionPopup: Story = {};
