import {
  generateMockTxnWithCurrency,
  mockGetNftOwner,
  mockGetNftOwnerTransfers,
  mockGetOwnerDetails,
  mockGetOwnerTransactions,
} from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react/*';

import { ActivityDetails } from '../../../src/pages/activity/activity-details';

const meta: Meta<typeof ActivityDetails> = {
  title: 'Pages/Activity',
  component: ActivityDetails,
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        nft: mockGetNftOwner,
        transactions: mockGetOwnerTransactions(),
        nftTransfer: mockGetNftOwnerTransfers,
      },
    },
    history: {
      activityDetails: { currentTransfer: generateMockTxnWithCurrency({}) },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityDetails>;

export const ActivityDetailsPage: Story = {};
