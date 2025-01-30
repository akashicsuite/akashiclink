import { Preferences } from '@capacitor/preferences';
import type { IOwnerTransactionsResponse } from '@helium-pay/backend';
import {
  TransactionResult,
  TransactionStatus,
  TransactionType,
} from '@helium-pay/backend';
import type { AxiosRequestConfig } from 'axios';
import Big from 'big.js';
import useSWRInfinite from 'swr/infinite';

import { REFRESH_INTERVAL } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  removeLocalTransactionByL2TxnHash,
  selectLocalTransactions,
} from '../../redux/slices/localTransactionSlice';
import fetcher from '../ownerFetcher';
import { useAccountStorage } from './useLocalAccounts';

const transferMeFetcher = async (
  path: string,
  config?: AxiosRequestConfig
): Promise<IOwnerTransactionsResponse> => {
  const hideSmallTransactions = await Preferences.get({
    key: 'hide-small-balances',
  });

  const url = path
    ? `${path}&hideSmallTransactions=${
        hideSmallTransactions.value &&
        ['true', 'false'].includes(hideSmallTransactions.value)
          ? hideSmallTransactions.value
          : 'true'
      }`
    : '';
  const data = await fetcher(url, config);
  return data as IOwnerTransactionsResponse;
};

export const useMyTransfersInfinite = (limit = 100, query = {}) => {
  const { activeAccount, cacheOtk } = useAccountStorage();
  const dispatch = useAppDispatch();
  const localTransactions = useAppSelector(selectLocalTransactions);

  const getKey = (
    pageIndex: number,
    previousPageData: IOwnerTransactionsResponse
  ) => {
    if (
      !activeAccount?.identity ||
      !cacheOtk || // not unlocked
      (previousPageData?.transactions && !previousPageData.transactions?.length) // reached the end
    )
      return null;

    return `/owner/transactions?${new URLSearchParams({
      ...query,
      identity: activeAccount?.identity ?? '',
      page: pageIndex.toString(),
      limit: limit.toString(),
    }).toString()}`; // SWR key
  };

  const {
    data,
    mutate: mutateMyTransfers,
    isLoading,
    size,
    ...response
  } = useSWRInfinite<IOwnerTransactionsResponse, Error>(
    getKey,
    transferMeFetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
    }
  );

  const result = {
    ...data?.[0], // other fields such as transactionCount
    transactions: data?.reduce(
      (prev, next) => {
        return [...prev, ...next.transactions];
      },
      [] as IOwnerTransactionsResponse['transactions']
    ), // grouped txns
  };

  const transactionL2Hashes = (result?.transactions ?? []).map(
    (t) => t.l2TxnHash
  );

  const duplicatedLocalTxnHashes = localTransactions
    .map((t) => t.l2TxnHash)
    // Remove duplicate local transactions
    .filter((t): t is string => !!t && transactionL2Hashes.includes(t));

  // remove local txns from redux store
  duplicatedLocalTxnHashes?.forEach((hash) => {
    dispatch(removeLocalTransactionByL2TxnHash(hash));
  });

  const transformedTransfers = [
    // Add local transactions to the list
    ...localTransactions.filter(
      (t) =>
        t.l2TxnHash &&
        !duplicatedLocalTxnHashes.includes(t.l2TxnHash) &&
        t.senderIdentity === activeAccount?.identity // take only txns belong to active account
    ),
    ...(result?.transactions ?? []),
  ].map((d) => ({
    ...d,
    // remove trailing zeros from amounts
    amount: Big(d.amount).toString(),
    // feesPaid could be undefined, remove trailing zeros if it is not
    feesPaid: d.feesPaid ? Big(d.feesPaid).toString() : d.feesPaid,
    // Dates come from backend as string so need to transform them here
    initiatedAt: new Date(d.initiatedAt),
    // HACK: set transactions with result = Failure to status = Failed
    // temporary solution until we finish the status code
    ...(d.result === TransactionResult.FAILURE && {
      status: TransactionStatus.FAILED,
    }),
    // Condition to determine the transaction type: if it's senderIdentity then withdraw else deposit
    type:
      d.senderIdentity === activeAccount?.identity
        ? TransactionType.WITHDRAWAL
        : TransactionType.DEPOSIT,
    // Checking if the tokenSymbol field exists and is not null and status is 'confirmed'
    // Otherwise, keep the existing value of the 'result'. Hence there is no result so it won't be in records.
    ...(d.tokenSymbol &&
      d.status === TransactionStatus.CONFIRMED && {
        result: TransactionResult.SUCCESS,
      }),
  }));

  return {
    transfers: transformedTransfers,
    mutateMyTransfers,
    transactionCount: result.transactionCount,
    isLoading: isLoading,
    isLoadingMore: size > 0 && data && typeof data[size - 1] === 'undefined',
    size: size,
    ...response,
  };
};
