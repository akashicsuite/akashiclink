import type { Meta, StoryObj } from '@storybook/react/*';

import { SettingsAboutUs } from '../../../../src/pages/settings/settings-about-us';

const meta: Meta<typeof SettingsAboutUs> = {
  title: 'Pages/Settings',
  component: SettingsAboutUs,
  args: {},
  parameters: {
    msw: {
      handlers: {},
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAboutUs>;

export const SettingsAboutUsPage: Story = {
  parameters: {
    msw: {
      handlers: {},
    },
  },
};
