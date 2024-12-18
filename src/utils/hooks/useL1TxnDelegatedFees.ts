import type { IDelegatedFeeValuesReturn } from '@helium-pay/backend';
import useSWR from 'swr';

import fetcher from '../ownerFetcher';

export const useL1TxnDelegatedFees = () => {
  const { data, ...response } = useSWR<IDelegatedFeeValuesReturn[], Error>(
    `/l1-txn-orchestrator/delegated-fees`,
    fetcher
  );
  return { delegatedFeeList: data ?? [], ...response };
};
