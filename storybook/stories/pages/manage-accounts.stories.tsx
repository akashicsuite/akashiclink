import type { Meta, StoryObj } from '@storybook/react';

import { ManageAccounts } from '../../../src/pages/manage-accounts/manage-accounts';

const meta: Meta<typeof ManageAccounts> = {
  title: 'Pages/Manage Accounts Page',
  component: ManageAccounts,
  args: {},
  parameters: {
    isLoggedIn: false,
  },
};

export default meta;
type Story = StoryObj<typeof ManageAccounts>;

export const ManageAccountsPage: Story = {
  args: {},
  parameters: {
    isLoggedIn: false,
  },
};
