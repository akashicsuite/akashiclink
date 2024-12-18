import { CoinSymbol } from '@helium-pay/backend';
import type { StoryContext, StoryFn } from '@storybook/react';
import { Provider } from 'react-redux';

import { getMockStore } from '../mocks/store';
import type {
  mockAccountStoreParams,
  mockCreateWalletStoreParams,
  mockPreferenceStateParams,
} from '../mocks/store/slice';

const DEFAULT_STORE_PARAMS: {
  account: mockAccountStoreParams;
  createWallet: mockCreateWalletStoreParams;
  preferences: mockPreferenceStateParams;
} = {
  account: {
    hasLocalAccounts: true,
    hasActiveAccount: true,
    isLoggedIn: true,
  },
  createWallet: { hasPassword: false },
  preferences: { coinSymbol: CoinSymbol.Ethereum_Mainnet },
};

export const useReduxProvider = (
  Story: StoryFn,
  { parameters: { store = DEFAULT_STORE_PARAMS } }: StoryContext
) => {
  const params = {
    account: {
      ...DEFAULT_STORE_PARAMS['account'],
      ...store?.account,
    },
    createWallet: {
      ...DEFAULT_STORE_PARAMS['createWallet'],
      ...store?.createWallet,
    },
    preferences: {
      ...DEFAULT_STORE_PARAMS['preferences'],
      ...store?.preferences,
    },
  };

  return (
    <Provider store={getMockStore(params)}>
      <Story />
    </Provider>
  );
};
