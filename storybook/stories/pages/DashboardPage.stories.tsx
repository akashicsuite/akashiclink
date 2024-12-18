import {
  mockGetNftOwner,
  mockGetNftOwnerTransfers,
  mockGetOwnerDetails,
  mockGetOwnerTransactions,
  PRESET_NFT_ALIAS,
  PRESET_OWNER_AAS_ALIAS,
  PRESET_OWNER_BALANCES,
} from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { Dashboard } from '../../../src/pages/dashboard/dashboard';
import { formatAmount } from '../../../src/utils/formatAmount';
import { sleep } from '../test/utli';

const meta: Meta<typeof Dashboard> = {
  title: 'Pages',
  component: Dashboard,
  args: {
    isPopup: false,
  },
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        nft: mockGetNftOwner,
        transactions: mockGetOwnerTransactions(),
        nftTransfer: mockGetNftOwnerTransfers,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

export const DashboardPage: Story = {
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        nft: mockGetNftOwner,
        transactions: mockGetOwnerTransactions(),
        nftTransfer: mockGetNftOwnerTransfers,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const MOCKED_ETH_BALANCE = PRESET_OWNER_BALANCES.find(
      (v) => v.coinSymbol === 'ETH'
    );

    await sleep(500);
    const accountBar = canvas.getByText(PRESET_OWNER_AAS_ALIAS);
    const ethAmountDisplay = canvas.getByText(
      `${formatAmount(MOCKED_ETH_BALANCE?.balance ?? '0')} ETH`
    );

    // the first "send" element is a button
    const sendButton = canvas.getAllByText('Send')[0];
    const depositButton = canvas.getByText('Deposit');

    const activityTab = within(
      canvas.getByTestId('activity-nft-tabs')
    ).getByText('Activity');
    const nftTab = within(canvas.getByTestId('activity-nft-tabs')).getByText(
      'NFT'
    );

    // expect account bar and amount on screen
    await expect(accountBar).toBeInTheDocument();
    await expect(ethAmountDisplay).toBeInTheDocument();

    // click send and deposit button
    await userEvent.click(sendButton, {
      delay: 100,
    });
    await userEvent.click(depositButton, {
      delay: 100,
    });

    await expect(activityTab).toBeInTheDocument();
    await expect(nftTab).toBeInTheDocument();

    // expect three "send" on screen, one for send button, two for send txns
    await expect(canvas.getAllByText('Send')).toHaveLength(3);

    // expect one of then is a nft transfer
    await expect(canvas.getByText(PRESET_NFT_ALIAS)).toBeInTheDocument();
  },
};
