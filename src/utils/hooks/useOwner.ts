import type { IOwnerInfoResponse } from '@helium-pay/backend';
import useSWR from 'swr';

import fetcher from '../ownerFetcher';

export const useOwner = () => {
  const {
    data: owner,
    mutate: mutateOwner,
    ...response
  } = useSWR<IOwnerInfoResponse, Error>(`/owner/me`, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    errorRetryCount: 1,
    errorRetryInterval: 1000,
  });

  return {
    owner,
    authenticated: !!owner?.ownerIdentity,
    mutateOwner,
    ...response,
  };
};
