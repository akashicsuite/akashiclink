import type { IOwnerDetailsResponse } from '@helium-pay/backend';
import useSWR from 'swr';

import { REFRESH_INTERVAL } from '../../constants';
import fetcher from '../ownerFetcher';
import { useAccountStorage } from './useLocalAccounts';

export const useAccountMe = () => {
  const { activeAccount } = useAccountStorage();
  return useSWR<IOwnerDetailsResponse>(
    activeAccount?.identity
      ? `/public-api/owner/details?address=${activeAccount?.identity}`
      : null,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL }
  );
};
