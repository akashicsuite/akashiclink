import type { Meta, StoryObj } from '@storybook/react';

import { ImportWalletPassword } from '../../../../src/pages/import-wallet/import-wallet-password';

const meta: Meta<typeof ImportWalletPassword> = {
  title: 'Pages/Import Wallet',
  component: ImportWalletPassword,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof ImportWalletPassword>;

export const ImportWalletPasswordPage: Story = {};
