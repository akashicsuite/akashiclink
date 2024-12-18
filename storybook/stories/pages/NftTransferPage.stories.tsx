import { mockGetNftOwner, mockGetOwnerDetails } from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react';

import { NftTransfer } from '../../../src/pages/nft/nft-transfer';

const meta: Meta<typeof NftTransfer> = {
  title: 'Pages/Nfts',
  component: NftTransfer,
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
type Story = StoryObj<typeof NftTransfer>;

export const NftTransferPage: Story = {
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        nft: mockGetNftOwner,
      },
    },
  },
};
