import {
  type CoinSymbol,
  type CurrencySymbol,
  type IExchangeRate,
  TEST_TO_MAIN,
} from '@helium-pay/backend';
import Big from 'big.js';
import useSWR from 'swr';

import { useAppSelector } from '../../redux/app/hooks';
import { selectFocusCurrencyDetail } from '../../redux/slices/preferenceSlice';
import { calculateInternalWithdrawalFee } from '../internal-fee';
import fetcher from '../ownerFetcher';

export const useExchangeRates = () => {
  const { data, ...response } = useSWR<IExchangeRate[], Error>(
    `/public-api/owner/exchange-rates`,
    fetcher
  );
  return {
    exchangeRates: data ?? [],
    ...response,
  };
};

export const useCalculateFocusCurrencyL2WithdrawalFee = () => {
  const { exchangeRates } = useExchangeRates();
  const { chain, token } = useAppSelector(selectFocusCurrencyDetail);

  return () => {
    return calculateInternalWithdrawalFee(exchangeRates, chain, token);
  };
};

export const useValueOfAmountInUSDT = () => {
  const { exchangeRates } = useExchangeRates();

  return (
    amount: string,
    coinSymbol: CoinSymbol,
    tokenSymbol?: CurrencySymbol
  ) => {
    const exchangeRate = Big(
      exchangeRates.find(
        (ex) =>
          !tokenSymbol &&
          ex.coinSymbol === (TEST_TO_MAIN.get(coinSymbol) || coinSymbol)
      )?.price || 1
    );

    return Big(amount).mul(exchangeRate);
  };
};
