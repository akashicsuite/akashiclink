import type { Meta, StoryObj } from '@storybook/react';

import { ImportWalletKeypair } from '../../../../src/pages/import-wallet/import-wallet-keypair';

const meta: Meta<typeof ImportWalletKeypair> = {
  title: 'Pages/Import Wallet',
  component: ImportWalletKeypair,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof ImportWalletKeypair>;

export const ImportWalletKeypairPage: Story = {};
