import {
  mockCheckL2,
  mockGetOwnerDetails,
  mockGetOwnerKeys,
} from '@helium-pay/api-mocks';
import type { Meta, StoryObj } from '@storybook/react';

import { SendPage } from '../../../src/pages/send/send';

const meta: Meta<typeof SendPage> = {
  title: 'Pages/Send Page',
  component: SendPage,
};

export default meta;
type Story = StoryObj<typeof SendPage>;

export const SendPageStory: Story = {
  name: 'Send Page',
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        keys: mockGetOwnerKeys,
        l2Check: mockCheckL2,
      },
    },
  },
};
