import { Preferences } from '@capacitor/preferences';
import axios from 'axios';

import { LAST_HISTORY_ENTRIES } from '../constants';
import { urls } from '../constants/urls';
import { history, historyResetStackAndRedirect } from '../routing/history';

const createAxiosInstance = (baseURL: string | undefined) => {
  return axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
};

export const axiosBase = createAxiosInstance(
  process.env.REACT_APP_API_BASE_URL
);
export const axiosBaseV1 = createAxiosInstance(
  process.env.REACT_APP_VERSION_ONE_API_BASE_URL
);

/**
 * Any request that 401s (auth cookie expired or not set) should chuck user
 * out to the landing page screen
 */
axiosBase.interceptors.response.use(
  // Pass through valid responses
  (response) => response,
  async (error) => {
    if (401 === error.response.status) {
      // Skip if already on root page, manage-account, create, or import pages
      if (
        history.location.pathname.match(
          /^\/$|\/(?:akashic$|manage-account|import-wallet|create-wallet)/
        )
      )
        return;

      await Preferences.remove({
        key: LAST_HISTORY_ENTRIES,
      });
      historyResetStackAndRedirect(urls.akashicPay);
    } else {
      return Promise.reject(error);
    }
  }
);
