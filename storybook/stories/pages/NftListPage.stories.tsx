import { mockGetNftOwner, mockGetOwnerDetails } from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react';

import { Nfts } from '../../../src/pages/nft/nfts';

const meta: Meta<typeof Nfts> = {
  title: 'Pages/Nfts',
  component: Nfts,
  args: {
    isPopup: false,
  },
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        nft: mockGetNftOwner,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Nfts>;

export const NftsListPage: Story = {
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        nft: mockGetNftOwner,
      },
    },
  },
};
