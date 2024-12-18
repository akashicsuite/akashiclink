import {
  mockGetNftOwner,
  mockGetNftOwnerTransfers,
  mockGetOwnerDetails,
  mockGetOwnerTransactions,
} from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react';

import { Activity } from '../../../src/pages/activity/activity';

const meta: Meta<typeof Activity> = {
  title: 'Pages/Activity',
  component: Activity,
};

export default meta;
type Story = StoryObj<typeof Activity>;

export const ActivityPage: Story = {
  name: 'Activity Page',
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        nft: mockGetNftOwner,
        transactions: mockGetOwnerTransactions(5),
        nftTransfer: mockGetNftOwnerTransfers,
      },
    },
  },
};
