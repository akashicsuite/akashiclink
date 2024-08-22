import { datadogRum } from '@datadog/browser-rum';
import type { IRetryCallback } from '@helium-pay/backend/src/modules/api-interfaces/callback/callback.interface';

import { useAppSelector } from '../../redux/app/hooks';
import { selectCacheOtk } from '../../redux/slices/accountSlice';
import { signAuthenticationData } from '../otk-generation';
import { unpackRequestErrorMessage } from '../unpack-request-error-message';

export type RetryCallbackToSign = Omit<IRetryCallback, 'signature'>;

export const useSignRetryCallback = () => {
  const cacheOtk = useAppSelector(selectCacheOtk);

  return async (retryCallback: RetryCallbackToSign) => {
    try {
      if (!cacheOtk) {
        throw new Error('GenericFailureMsg');
      }

      // WalletConnect requires the 0x-prefix
      return (
        '0x' + signAuthenticationData(cacheOtk.key.prv.pkcs8pem, retryCallback)
      );
    } catch (error) {
      datadogRum.addError(error);
      return unpackRequestErrorMessage(error);
    }
  };
};
