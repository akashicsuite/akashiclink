import type { INft } from '@helium-pay/backend';
import useSWR from 'swr';

import { REFRESH_INTERVAL } from '../../constants';
import fetcher from '../ownerFetcher';
import { useAccountStorage } from './useLocalAccounts';

export const useNftMe = () => {
  const { activeAccount, cacheOtk } = useAccountStorage();
  const {
    data,
    mutate: mutateNftMe,
    ...response
  } = useSWR<INft[], Error>(
    activeAccount?.identity && cacheOtk
      ? `/nft/owner/${activeAccount?.identity}`
      : null,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
    }
  );
  return { nfts: data ?? [], mutateNftMe, ...response };
};
