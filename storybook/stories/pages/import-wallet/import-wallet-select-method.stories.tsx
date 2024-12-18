import type { Meta, StoryObj } from '@storybook/react';

import { ImportWalletSelectMethod } from '../../../../src/pages/import-wallet/import-wallet-select-method';

const meta: Meta<typeof ImportWalletSelectMethod> = {
  title: 'Pages/Import Wallet',
  component: ImportWalletSelectMethod,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof ImportWalletSelectMethod>;

export const ImportWalletSelectMethodPage: Story = {};
