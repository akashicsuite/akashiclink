import {
  PRESET_L2_ADDRESS,
  PRESET_L2_ADDRESS_2,
  PRESET_NFT_LEDGER_ID,
  PRESET_OWNER_AAS_ALIAS,
} from '@helium-pay/api-mocks';

import type { AccountState } from '../../../../src/redux/slices/accountSlice';
import { mockCacheOtk } from '../preset';

export const mockActiveAccount = {
  identity: PRESET_L2_ADDRESS,
  alias: PRESET_OWNER_AAS_ALIAS,
  ledgerId: PRESET_NFT_LEDGER_ID,
};

export const mockLocalAccounts = [
  mockActiveAccount,
  {
    identity: PRESET_L2_ADDRESS_2,
  },
];

export type mockAccountStoreParams = {
  hasLocalAccounts: boolean;
  hasActiveAccount: boolean;
  isLoggedIn: boolean;
};

export const getMockAccountSlice = ({
  hasLocalAccounts = true,
  hasActiveAccount = true,
  isLoggedIn = true,
}: mockAccountStoreParams): { accountSlice: AccountState } => {
  return {
    accountSlice: {
      localAccounts: hasLocalAccounts ? mockLocalAccounts : [],
      activeAccount: hasActiveAccount ? mockActiveAccount : null,
      cacheOtk: isLoggedIn ? mockCacheOtk : null,
    },
  };
};
