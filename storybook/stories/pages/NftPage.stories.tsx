import { mockGetNftOwner, mockGetOwnerDetails } from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react';

import { Nft } from '../../../src/pages/nft/nft';

const meta: Meta<typeof Nft> = {
  title: 'Pages/Nfts',
  component: Nft,
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
    history: {
      nft: {
        nftName: 'Candypig First Edition #1377-TEST1',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Nft>;

export const NftPage: Story = {
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        nft: mockGetNftOwner,
      },
    },
  },
};
