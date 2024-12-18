import type { Meta, StoryObj } from '@storybook/react';

import { ImportWalletSuccessful } from '../../../../src/pages/import-wallet/import-wallet-successful';

const meta: Meta<typeof ImportWalletSuccessful> = {
  title: 'Pages/Import Wallet',
  component: ImportWalletSuccessful,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof ImportWalletSuccessful>;

export const ImportWalletSuccessfulPage: Story = {};
