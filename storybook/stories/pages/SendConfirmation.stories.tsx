import {
  mockCheckL2,
  mockGetOwnerDetails,
  mockGetOwnerKeys,
  PRESET_L2_ADDRESS,
  PRESET_L2_ADDRESS_2,
  PRESET_L2_TXN_HASH,
} from '@helium-pay/api-mocks';
import { TransactionLayer } from '@helium-pay/backend';
import type { Meta, StoryObj } from '@storybook/react';

import { SendConfirmationPage } from '../../../src/pages/send/send-confirmation';

const meta: Meta<typeof SendConfirmationPage> = {
  title: 'Pages/Send Confirmation Page',
  component: SendConfirmationPage,
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
type Story = StoryObj<typeof SendConfirmationPage>;

export const SendConfirmationPageStoryWaiting: Story = {
  name: 'Send Confirmation Page Waiting for Transaction',
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        keys: mockGetOwnerKeys,
        l2Check: mockCheckL2,
      },
    },
    history: {
      sendConfirm: {
        validatedAddressPair: {
          convertedToAddress: PRESET_L2_ADDRESS,
          userInputToAddress: PRESET_L2_ADDRESS,
        },
        txn: {
          txToSign: {
            $sigs: 'lorem',
            $tx: {
              $contract: 'bogus',
              $namespace: 'bogus',
              $i: 'bogus',
            },
          },
          layer: TransactionLayer.L1,
          amount: '124',
        },
      },
    },
  },
};

export const SendConfirmationPageStorySuccessful: Story = {
  name: 'Send Confirmation Page Successful',
  parameters: {
    msw: {
      handlers: {
        owner: mockGetOwnerDetails,
        keys: mockGetOwnerKeys,
        l2Check: mockCheckL2,
      },
    },
    history: {
      sendConfirm: {
        validatedAddressPair: {
          convertedToAddress: PRESET_L2_ADDRESS,
          userInputToAddress: PRESET_L2_ADDRESS,
        },
        txnFinal: {
          txHash: PRESET_L2_TXN_HASH,
        },
        txn: {
          fromAddress: PRESET_L2_ADDRESS,
          toAddress: PRESET_L2_ADDRESS_2,
          txToSign: {
            $sigs: 'lorem',
            $tx: {
              $contract: 'bogus',
              $namespace: 'bogus',
              $i: 'bogus',
            },
          },
          layer: TransactionLayer.L1,
          amount: '124',
        },
      },
    },
  },
};
