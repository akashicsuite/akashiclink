import type { Meta, StoryObj } from '@storybook/react/*';

import { SettingsSecurity } from '../../../../src/pages/settings/settings-security';

const meta: Meta<typeof SettingsSecurity> = {
  title: 'Pages/Settings',
  component: SettingsSecurity,
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
type Story = StoryObj<typeof SettingsSecurity>;

export const SettingsSecurityPage: Story = {
  parameters: {
    msw: {
      handlers: {},
    },
  },
};
