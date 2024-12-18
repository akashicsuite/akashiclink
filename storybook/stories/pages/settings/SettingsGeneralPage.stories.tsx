import type { Meta, StoryObj } from '@storybook/react/*';

import { SettingsGeneral } from '../../../../src/pages/settings/settings-general';

const meta: Meta<typeof SettingsGeneral> = {
  title: 'Pages/Settings',
  component: SettingsGeneral,
  args: {
    isPoup: false,
  },
  parameters: {
    msw: {
      handlers: {},
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsGeneral>;

export const SettingsGeneralPage: Story = {
  parameters: {
    msw: {
      handlers: {},
    },
  },
};
