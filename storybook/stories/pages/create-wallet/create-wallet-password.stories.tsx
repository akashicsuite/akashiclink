import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { CreateWalletPassword } from '../../../../src/pages/create-wallet/create-wallet-create-password';

const meta: Meta<typeof CreateWalletPassword> = {
  title: 'Pages/CreateWallet',
  component: CreateWalletPassword,
};

export default meta;
type Story = StoryObj<typeof CreateWalletPassword>;

export const CreateWalletPasswordPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const agreeCheckbox = canvas.getByText(
      'I understand that AkashicLink cannot recover this password for me'
    );
    // expect to be able to click the checkbox
    await userEvent.click(agreeCheckbox);
  },
};
