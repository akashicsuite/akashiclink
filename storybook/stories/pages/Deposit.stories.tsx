import {
  mockGetNftOwnerTransfers,
  mockGetOwnerDetails,
  mockGetOwnerKeys,
  mockGetOwnerTransactions,
} from '@helium-pay/api-mocks';
import { CoinSymbol } from '@helium-pay/backend';
import type { Meta, StoryObj } from '@storybook/react';

import { DepositPage } from '../../../src/pages/deposit/deposit-page';

const meta: Meta<typeof DepositPage> = {
  title: 'Pages/Deposit',
  component: DepositPage,
};

export default meta;
type Story = StoryObj<typeof DepositPage>;

export const DepositPageExistingWallet: Story = {
  name: 'Deposit Page',
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        keys: mockGetOwnerKeys(),
        transactions: mockGetOwnerTransactions(1),
        nftTransfer: mockGetNftOwnerTransfers,
      },
    },
    store: {
      preferences: { coinSymbol: CoinSymbol.Tron_Shasta },
    },
  },
};

export const DepositPageNoWallet: Story = {
  name: 'Deposit Page No Wallet',
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        keys: mockGetOwnerKeys(true),
        transactions: mockGetOwnerTransactions(1),
        nftTransfer: mockGetNftOwnerTransfers,
      },
    },
    store: {
      preferences: { coinSymbol: CoinSymbol.Tron_Shasta },
    },
  },
};

export const DepositPageNotAllowedWallet: Story = {
  name: 'Deposit Page Not Allowed',
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        keys: mockGetOwnerKeys(),
        transactions: mockGetOwnerTransactions(1),
        nftTransfer: mockGetNftOwnerTransfers,
      },
    },
    store: {
      preferences: { coinSymbol: CoinSymbol.Tron },
    },
  },
};
