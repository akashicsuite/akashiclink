import type { INftTransactionRecord } from '@helium-pay/backend';
import { TransactionStatus, TransactionType } from '@helium-pay/backend';
import useSWR from 'swr';

import { REFRESH_INTERVAL } from '../../constants';
import fetcher from '../ownerFetcher';
import { useAccountStorage } from './useLocalAccounts';

export const useNftTransfersMe = (query = {}) => {
  const { activeAccount, cacheOtk } = useAccountStorage();

  const params = new URLSearchParams({
    ...query,
  });

  const {
    data,
    mutate: mutateNftTransfersMe,
    ...response
  } = useSWR<INftTransactionRecord[], Error>(
    activeAccount?.identity && cacheOtk
      ? `/nft/owner/${activeAccount?.identity}/transfers?${params.toString()}`
      : null,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL }
  );
  // HACK: filter out pending transactions
  const filteredData = data
    ?.filter(
      (t: { status: TransactionStatus }) =>
        t.status !== TransactionStatus.PENDING
    )
    .map((t) =>
      t.fromAddress === activeAccount?.identity
        ? { ...t, type: TransactionType.WITHDRAWAL }
        : { ...t, type: TransactionType.DEPOSIT }
    );

  return {
    transfers: filteredData ?? [],
    mutateNftTransfersMe,
    ...response,
  };
};
