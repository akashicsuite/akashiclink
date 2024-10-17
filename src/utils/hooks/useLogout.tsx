import { Preferences } from '@capacitor/preferences';
import { mutate } from 'swr';

import { LAST_HISTORY_ENTRIES } from '../../constants';
import { urls } from '../../constants/urls';
import { historyResetStackAndRedirect } from '../../routing/history';
import { EXTENSION_EVENT, responseToSite } from '../chrome';
import { useAccountStorage } from './useLocalAccounts';

export function useLogout() {
  const { setCacheOtk } = useAccountStorage();

  return async () => {
    // Clear session variables
    setCacheOtk(null);
    await Preferences.remove({
      key: LAST_HISTORY_ENTRIES,
    });

    // Clear the SWR cache for every key
    await mutate((_key) => true, undefined, { revalidate: false });

    await responseToSite({
      event: EXTENSION_EVENT.USER_LOCKED_WALLET,
    });

    // completely reset router history
    await historyResetStackAndRedirect(urls.akashicPay);
  };
}
