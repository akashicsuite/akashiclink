import type { Meta, StoryObj } from '@storybook/react';

import { LanguageDropdown as LanguageDropdownComponent } from '../../../src/components/layout/toolbar/language-select';

const meta: Meta<typeof LanguageDropdownComponent> = {
  title: 'Components',
  component: LanguageDropdownComponent,
};

export default meta;
type Story = StoryObj<typeof LanguageDropdownComponent>;

export const LanguageDropdown: Story = {};
