import type { Meta, StoryObj } from '@storybook/react';

import { ImportWalletSecret } from '../../../../src/pages/import-wallet/import-wallet-secret';

const meta: Meta<typeof ImportWalletSecret> = {
  title: 'Pages/Import Wallet',
  component: ImportWalletSecret,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof ImportWalletSecret>;

export const ImportWalletSecretPage: Story = {};
