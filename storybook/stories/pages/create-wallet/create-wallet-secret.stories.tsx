import type { Meta, StoryObj } from '@storybook/react';

import { CreateWalletSecret } from '../../../../src/pages/create-wallet/create-wallet-secret';

const meta: Meta<typeof CreateWalletSecret> = {
  title: 'Pages/CreateWallet',
  component: CreateWalletSecret,
};

export default meta;
type Story = StoryObj<typeof CreateWalletSecret>;

export const CreateWalletSecretPage: Story = {};
