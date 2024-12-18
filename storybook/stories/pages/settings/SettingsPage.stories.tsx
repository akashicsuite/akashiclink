import type { Meta, StoryObj } from '@storybook/react/*';

import { Settings } from '../../../../src/pages/settings/settings';

const meta: Meta<typeof Settings> = {
  title: 'Pages/Settings',
  component: Settings,
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
type Story = StoryObj<typeof Settings>;

export const SettingsPage: Story = {
  parameters: {
    msw: {
      handlers: {},
    },
  },
};
