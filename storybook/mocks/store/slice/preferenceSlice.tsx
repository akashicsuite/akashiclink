import type { CurrencySymbol } from '@helium-pay/backend';
import { CoinSymbol } from '@helium-pay/backend';

import type { PreferenceState } from '../../../../src/redux/slices/preferenceSlice';

export const mockFocusCurrency = {
  chain: CoinSymbol.Ethereum_Mainnet,
  displayName: 'ETH',
};

export type mockPreferenceStateParams = {
  coinSymbol?: CoinSymbol;
  tokenSymbol?: CurrencySymbol;
};

export const getMockPreferenceSlice = ({
  coinSymbol,
  tokenSymbol,
}: mockPreferenceStateParams): { preferenceSlice: PreferenceState } => {
  return {
    preferenceSlice: {
      theme: 'light',
      focusCurrency: coinSymbol
        ? { chain: coinSymbol, token: tokenSymbol, displayName: coinSymbol }
        : mockFocusCurrency,
      autoLockTime: 10,
    },
  };
};
