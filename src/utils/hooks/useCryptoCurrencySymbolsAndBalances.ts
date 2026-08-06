import {
  type CryptoCurrencyWithName,
  NetworkDictionary,
} from '@akashic/as-backend';

import { getMainnetEquivalent } from '../chain';
import { useCryptoCurrencyBalance } from './useCryptoCurrencyBalance';
import { useL1TxnDelegatedFees } from './useL1TxnDelegatedFees';

// TODO: check if this is duplicated with other hooks
export function useCryptoCurrencySymbolsAndBalances(
  walletCurrency: CryptoCurrencyWithName
) {
  const { delegatedFeeList } = useL1TxnDelegatedFees();

  const { balance: currencyBalance } = useCryptoCurrencyBalance(
    walletCurrency.coinSymbol,
    walletCurrency.tokenSymbol
  );
  const { balance: nativeCoinBalance } = useCryptoCurrencyBalance(
    walletCurrency.coinSymbol
  );

  const isCurrencyTypeToken = typeof walletCurrency.tokenSymbol !== 'undefined';
  const nativeCoin = NetworkDictionary[walletCurrency.coinSymbol].nativeCoin;
  const delegatedFee =
    delegatedFeeList.find(
      (fee) =>
        fee.coinSymbol === getMainnetEquivalent(walletCurrency.coinSymbol)
    )?.delegatedFee ?? '0';

  return {
    isCurrencyTypeToken,
    chain: walletCurrency.coinSymbol,
    token: walletCurrency.tokenSymbol,
    networkCurrencyCombinedDisplayName: walletCurrency.displayName,
    currencySymbol: isCurrencyTypeToken
      ? (walletCurrency.tokenSymbol as string)
      : nativeCoin.displayName,
    currencyBalance: currencyBalance ?? '0',
    nativeCoinSymbol: nativeCoin.displayName,
    nativeCoinBalance: nativeCoinBalance ?? '0',
    delegatedFee: delegatedFee,
  };
}
