import type {
  INftTransactionRecord,
  INftTransactionRecordRequest,
} from '@helium-pay/backend';
import { TransactionStatus, TransactionType } from '@helium-pay/backend';
import buildURL from 'axios/unsafe/helpers/buildURL';
import useSWR from 'swr';

import { REFRESH_INTERVAL } from '../../constants';
import fetcher from '../ownerFetcher';
import { useAccountStorage } from './useLocalAccounts';

export const useNftTransfersMe = (params?: INftTransactionRecordRequest) => {
  const { activeAccount } = useAccountStorage();
  const {
    data,
    mutate: mutateNftTransfersMe,
    ...response
  } = useSWR<INftTransactionRecord[], Error>(
    activeAccount?.identity
      ? buildURL(`/nft/owner/${activeAccount?.identity}`, params)
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
