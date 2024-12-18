import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, userEvent, within } from '@storybook/test';

import { AkashicPayMain } from '../../../src/pages/akashic-main';
import { sleep } from '../test/utli';

const meta: Meta<typeof AkashicPayMain> = {
  title: 'Pages',
  component: AkashicPayMain,
  args: {
    isPopup: false,
  },
  parameters: {
    store: {
      account: {
        isLoggedIn: false,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AkashicPayMain>;

export const LoginPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const title = canvas.getByText('Welcome back!');
    const subtitle = canvas.getByText('Empowering Your Wealth');
    const unlockButton = canvas.getByText('Unlock');
    const passwordField = canvas.getByPlaceholderText('Password');

    // expect these element on screen
    await expect(title).toBeInTheDocument();
    await expect(subtitle).toBeInTheDocument();
    await expect(passwordField).toBeInTheDocument();

    // expect to be able to type in password field
    await fireEvent(
      passwordField,
      new CustomEvent('ionInput', {
        detail: { value: 'Text1234' },
      })
    );

    // expect the unlock Button to be clickable
    await userEvent.click(unlockButton, {
      delay: 100,
    });

    await sleep(300);

    // expect a failure modal that can be closed
    const modalCloseButton = canvas.getByTestId('custom-alert-close-button');
    await expect(modalCloseButton).toBeInTheDocument();

    await userEvent.click(modalCloseButton, {
      delay: 100,
    });
  },
};
