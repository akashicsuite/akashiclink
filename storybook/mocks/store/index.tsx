import { makeStore } from '../../../src/redux/app/store';
import type {
  mockAccountStoreParams,
  mockCreateWalletStoreParams,
  mockPreferenceStateParams,
} from './slice';
import {
  getCreateWalletSlice,
  getMockAccountSlice,
  getMockPreferenceSlice,
} from './slice';

export const getMockStore = ({
  account,
  createWallet,
  preferences,
}: {
  account: mockAccountStoreParams;
  createWallet: mockCreateWalletStoreParams;
  preferences: mockPreferenceStateParams;
}) => {
  return makeStore({
    ...getMockAccountSlice(account),
    ...getCreateWalletSlice(createWallet),
    ...getMockPreferenceSlice(preferences),
  });
};
