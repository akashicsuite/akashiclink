import type { IConfigResponse } from '@helium-pay/backend';
import { isPlatform } from '@ionic/react';
import useSWR from 'swr';

import fetcher from '../ownerFetcher';

export const useConfig = () => {
  const { data, isLoading } = useSWR<IConfigResponse, Error>(
    `/config`,
    fetcher
  );

  let config;

  if (!!data) {
    switch (true) {
      case isPlatform('ios'):
        config = {
          awMinVersion: data.awMinVersionIos,
          awLatestVersion: data.awLatestVersionIos,
          awUrl: data.awUrlIos,
          highlights: data.highlights?.ios,
          addressScreeningFeeCollectorIdentity:
            data.addressScreeningFeeCollectorIdentity,
          addressScreeningFee: data.addressScreeningFee,
        };
        break;
      case isPlatform('android'):
        config = {
          awMinVersion: data.awMinVersionAndroid,
          awLatestVersion: data.awLatestVersionAndroid,
          awUrl: data.awUrlAndroid,
          highlights: data.highlights?.android,
          addressScreeningFeeCollectorIdentity:
            data.addressScreeningFeeCollectorIdentity,
          addressScreeningFee: data.addressScreeningFee,
        };
        break;
      default:
        config = {
          awMinVersion: data.awMinVersionExtension,
          awLatestVersion: data.awLatestVersionExtension,
          awUrl: data.awUrlExtension,
          highlights: data.highlights?.extension,
          addressScreeningFeeCollectorIdentity:
            data.addressScreeningFeeCollectorIdentity,
          addressScreeningFee: data.addressScreeningFee,
        };
    }
  }

  return {
    config: data ? config : undefined,
    isLoading,
  };
};
