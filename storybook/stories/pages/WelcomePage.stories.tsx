import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { AkashicPayMain } from '../../../src/pages/akashic-main';

const meta: Meta<typeof AkashicPayMain> = {
  title: 'Pages',
  component: AkashicPayMain,
  args: {
    isPopup: false,
  },
  parameters: {
    store: {
      account: {
        hasLocalAccounts: false,
        isLoggedIn: false,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AkashicPayMain>;

export const WelcomePage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const agreeCheckbox = canvas.getByText('I agree to AkashicLink');
    const createAccountButton = canvas.getByText('Create your Account');
    const importAccountButton = canvas.getByText('Import Account');

    // expect the two buttons are disabled
    await expect(createAccountButton).toBeDisabled();
    await expect(importAccountButton).toBeDisabled();

    // expect to be able to click the checkbox
    await userEvent.click(agreeCheckbox, {
      delay: 100,
    });

    // Test both buttons to be clickable now
    await userEvent.click(createAccountButton, {
      delay: 100,
    });

    await userEvent.click(importAccountButton, {
      delay: 100,
    });
  },
};
