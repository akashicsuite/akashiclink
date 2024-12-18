import type { Meta, StoryObj } from '@storybook/react';

import { StyledInput as SI } from '../../../../src/components/common/input/styled-input';

const meta: Meta<typeof SI> = {
  title: 'Components/Common/Input',
  component: SI,
  tags: ['autodocs'],
  args: {
    errorPrompt: 'EmailHelpText',
  },
  argTypes: {
    submitOnEnter: {
      action: 'clicked',
      table: {
        disable: true,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SI>;

export const Horizontal: Story = {
  args: {
    validate: (v) => v === 'AA',
    label: 'Horizontal',
    isHorizontal: true,
  },
};

export const Vertical: Story = {
  args: {
    label: 'Label Vertical',
    isHorizontal: false,
  },
};
