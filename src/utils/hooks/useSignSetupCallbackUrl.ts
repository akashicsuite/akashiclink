import { datadogRum } from '@datadog/browser-rum';
import type { ISetCallbackUrls } from '@helium-pay/backend';

import { useAppSelector } from '../../redux/app/hooks';
import { selectCacheOtk } from '../../redux/slices/accountSlice';
import { signAuthenticationData } from '../otk-generation';
import { unpackRequestErrorMessage } from '../unpack-request-error-message';

export type SetCallbackUrlsToSign = Omit<ISetCallbackUrls, 'signature'>;

export const useSignSetupCallbackUrl = () => {
  const cacheOtk = useAppSelector(selectCacheOtk);

  return async (setCallbackUrls: SetCallbackUrlsToSign) => {
    try {
      if (!cacheOtk) {
        throw new Error('GenericFailureMsg');
      }

      // WalletConnect requires the 0x-prefix
      return (
        '0x' +
        signAuthenticationData(cacheOtk.key.prv.pkcs8pem, setCallbackUrls)
      );
    } catch (error) {
      datadogRum.addError(error);
      return unpackRequestErrorMessage(error);
    }
  };
};