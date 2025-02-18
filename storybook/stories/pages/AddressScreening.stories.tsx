import type { Meta, StoryObj } from '@storybook/react';

import { AddressScreeningHistoryList } from '../../../src/pages/address-screening/AddressScreeningHistoryList';

const meta: Meta<typeof AddressScreeningHistoryList> = {
  title: 'Pages/Address Screening',
  component: AddressScreeningHistoryList,
};

export default meta;
type Story = StoryObj<typeof AddressScreeningHistoryList>;

export const AddressScreeningPage: Story = {
  name: 'Address Screening Page',
};
