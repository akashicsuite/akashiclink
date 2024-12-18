import type { Meta, StoryObj } from '@storybook/react/*';

import { ChangePassword } from '../../../../src/pages/settings/change-password/enter-passwords';

const meta: Meta<typeof ChangePassword> = {
  title: 'Pages/Settings',
  component: ChangePassword,
  args: {
    isPopup: false,
  },
  parameters: {
    msw: {
      handlers: {},
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChangePassword>;

export const SettingsChangePasswordPage: Story = {
  parameters: {
    msw: {
      handlers: {},
    },
  },
};
