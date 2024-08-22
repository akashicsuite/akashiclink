import type {
  CoinSymbol,
  CurrencySymbol,
  IExchangeRate,
} from '@helium-pay/backend';
import { TEST_TO_MAIN } from '@helium-pay/backend';
import Big from 'big.js';

/**
 * Calculates internal withdrawal fee for the specified amount to send. Fee is charged in same currency as user wants to send.
 * Fee is always 0.1 USDT (or equivalent in relevant currency)
 *
 * Currently only charged for L2 transactions
 */
export function calculateInternalWithdrawalFee(
  exchangeRates: IExchangeRate[],
  coinSymbol: CoinSymbol,
  tokenSymbol?: CurrencySymbol
): string {
  const internalFeeBase = '0.1';
  const exchangeRate = Big(
    exchangeRates.find(
      (ex) =>
        !tokenSymbol &&
        ex.coinSymbol === (TEST_TO_MAIN.get(coinSymbol) || coinSymbol)
    )?.price || 1
  );

  return Big(internalFeeBase).div(exchangeRate).toPrecision(2);
}
