import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';

import { ManageAccountsModal } from '../../../../src/pages/manage-accounts/manage-accounts-modal';

const ManageAccountsModalComponent = (args: { isOpen: boolean }) => {
  return (
    <ManageAccountsModal
      modal={useRef<HTMLIonModalElement>(null)}
      isOpen={args.isOpen}
      setIsOpen={() => undefined}
    />
  );
};

const meta: Meta<typeof ManageAccountsModalComponent> = {
  title: 'Modals/Manage Accounts Modal',
  component: ManageAccountsModalComponent,
};

export default meta;
type Story = StoryObj<typeof ManageAccountsModalComponent>;

export const ManageAccountsModalPage: Story = {
  args: {
    isOpen: true,
  },
};

export const ManageAccountsModalMobilePage: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone6',
    },
  },
};
