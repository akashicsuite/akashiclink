import type { IInternalFee } from '@helium-pay/backend';
import {
  type CoinSymbol,
  type CurrencySymbol,
  NetworkDictionary,
  otherError,
} from '@helium-pay/backend';
import { BadRequestException } from '@nestjs/common';
import Big from 'big.js';

/**
 * Method for safe conversion from the smallest, indivisible coin/token unit, to
 * the human-friendly, divisible units displayed in the UI.
 * @example from SUN to TRX
 * convertFromSmallestUnit('9_987_543', 'TRX') => '9.876_543'
 * @example from WEI to ETH
 * convertFromSmallestUnit('1_234_567_890_123_456_789', 'ETH') => '1.234_567_890_123_456_789'
 * @param amount a string representing the amount in the smallest unit
 *
 * @throws BadRequestException if:
 * - the coin/token combination is not supported
 * - the amount cannot be represented as an integer in the smallest denomination
 */
export function convertFromSmallestUnit(
  amount: string,
  coinSymbol: CoinSymbol,
  tokenSymbol?: CurrencySymbol
): string {
  const bigAmount = Big(amount);
  throwIfNotInteger(bigAmount);

  const conversionFactor = getConversionFactor(coinSymbol, tokenSymbol);
  return Big(10)
    .pow(conversionFactor * -1)
    .times(bigAmount)
    .toFixed(conversionFactor);
}

/**
 * Method for safe conversion from the human-friendly, divisible units displayed
 * in the UI, to the smallest, indivisible coin/token unit.
 * @example from TRX to SUN
 * convertFromSmallestUnit('9.876_543', 'TRX') => '9_987_543'
 * @example from WEI to ETH
 * convertFromSmallestUnit('1.234_567_890_123_456_789', 'ETH') => '1_234_567_890_123_456_789'
 * @param amount a string representing the amount in human-friendly, divisible units
 *
 * @throws BadRequestException if:
 * - the coin/token combination is not supported
 * - the amount cannot be represented as an integer in the smallest denomination
 */
export function convertToSmallestUnit(
  amount: string,
  coinSymbol: CoinSymbol,
  tokenSymbol?: CurrencySymbol
): string {
  const conversionFactor = getConversionFactor(coinSymbol, tokenSymbol);
  const convertedAmount = Big(10).pow(conversionFactor).times(amount);
  throwIfNotInteger(convertedAmount);

  return convertedAmount.toFixed();
}

export interface CurrencyObject {
  coinSymbol: CoinSymbol;
  tokenSymbol?: CurrencySymbol;
  amount?: string;
  feesEstimate?: string;
  feesPaid?: string;
  internalFee?: IInternalFee;
}

export interface MetaCurrencyObject {
  [key: string]: MetaCurrencyObject | CurrencyObject;
}

export type AnyCurrencyData =
  | CurrencyObject
  | CurrencyObject[]
  | MetaCurrencyObject
  | MetaCurrencyObject[];

/**
 * Map amounts and fee-props in objects and arrays that contain currency data,
 * however deeply nested
 *
 * @param object object or array with currency data in it... somewhere
 * @param converter either {@link convertToSmallestUnit} or {@link convertFromSmallestUnit}
 * @returns object/array with the same structure, but converted amounts
 */
export function convertObjectCurrencies<T extends AnyCurrencyData>(
  object: T,
  converter: typeof convertToSmallestUnit | typeof convertFromSmallestUnit
): T {
  // recursively convert the elements if it's an array
  if (Array.isArray(object)) {
    return object.map((o) => convertObjectCurrencies(o, converter)) as T;
  }

  // Just in case :P
  if (typeof object !== 'object' || !Object.keys(object).length) return object;

  // check for "meta" currency objects, where the currency object is nested
  if (!('coinSymbol' in object))
    return Object.fromEntries(
      Object.entries(object).map(([key, value]) => [
        key,
        typeof value === 'object'
          ? convertObjectCurrencies(value, converter)
          : value,
      ])
    ) as T;

  const {
    coinSymbol,
    amount,
    tokenSymbol,
    internalFee,
    feesEstimate,
    feesPaid,
  } = object as CurrencyObject;
  const convert = (value: string, tokenSymbol?: CurrencySymbol) =>
    converter(value, coinSymbol, tokenSymbol);

  return {
    ...object,
    ...(amount ? { amount: convert(amount, tokenSymbol) } : {}),
    ...(feesEstimate ? { feesEstimate: convert(feesEstimate) } : {}),
    ...(feesPaid ? { feesPaid: convert(feesPaid) } : {}),
    ...(internalFee
      ? {
          internalFee: {
            ...(internalFee.withdraw
              ? { withdraw: convert(internalFee.withdraw, tokenSymbol) }
              : {}),
            ...(internalFee.deposit
              ? { deposit: convert(internalFee.deposit, tokenSymbol) }
              : {}),
          },
        }
      : {}),
  };
}

function getConversionFactor(
  coinSymbol: CoinSymbol,
  tokenSymbol?: CurrencySymbol
): number {
  if (!tokenSymbol) return NetworkDictionary[coinSymbol].nativeCoin.decimal;

  const token = NetworkDictionary[coinSymbol].tokens.find(
    (t) => t.symbol === tokenSymbol
  );
  if (!token) throw new BadRequestException(otherError.unsupportedCoinError);

  return token.decimal;
}

function throwIfNotInteger(amount: Big) {
  if (amount.mod(1).toString() !== '0')
    throw new BadRequestException(otherError.transactionTooSmallError);
}
