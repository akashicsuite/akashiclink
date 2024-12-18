import type { Meta, StoryObj } from '@storybook/react/*';

import { SettingsBackup } from '../../../../src/pages/settings/settings-backup';

const meta: Meta<typeof SettingsBackup> = {
  title: 'Pages/Settings',
  component: SettingsBackup,
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
type Story = StoryObj<typeof SettingsBackup>;

export const SettingsBackupPage: Story = {
  parameters: {
    msw: {
      handlers: {},
    },
  },
};
