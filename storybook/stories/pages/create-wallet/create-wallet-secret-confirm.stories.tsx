import type { Meta, StoryObj } from '@storybook/react';

import { CreateWalletSecretConfirm } from '../../../../src/pages/create-wallet/create-wallet-secret-confirm';

const meta: Meta<typeof CreateWalletSecretConfirm> = {
  title: 'Pages/CreateWallet',
  component: CreateWalletSecretConfirm,
  parameters: {
    store: {
      createWallet: {
        hasPassword: true,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CreateWalletSecretConfirm>;

export const CreateWalletSecretConfirmPage: Story = {};
