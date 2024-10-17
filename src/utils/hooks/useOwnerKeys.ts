import type { IOwnerOldestKeysResponse } from '@helium-pay/backend';
import useSWR from 'swr';

import fetcher from '../ownerFetcher';

export const useOwnerKeys = (address: string) => {
  const { data, ...response } = useSWR<IOwnerOldestKeysResponse[], Error>(
    `/owner/keys?address=${address}`,
    fetcher
  );
  return { keys: data ?? [], ...response };
};
