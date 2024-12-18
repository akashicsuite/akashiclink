import type { IConfigResponse } from '@helium-pay/backend';
import { isPlatform } from '@ionic/react';
import useSWR from 'swr';

import fetcher from '../ownerFetcher';

export const useConfig = () => {
  const { data, isLoading } = useSWR<IConfigResponse, Error>(
    `/config`,
    fetcher
  );
  return {
    config: !data
      ? undefined
      : isPlatform('ios')
        ? {
            awMinVersion: data.awMinVersionIos,
            awLatestVersion: data.awLatestVersionIos,
            awUrl: data.awUrlIos,
            highlights: data.highlights?.ios,
          }
        : isPlatform('android')
          ? {
              awMinVersion: data.awMinVersionAndroid,
              awLatestVersion: data.awLatestVersionAndroid,
              awUrl: data.awUrlAndroid,
              highlights: data.highlights?.android,
            }
          : {
              awMinVersion: data.awMinVersionExtension,
              awLatestVersion: data.awLatestVersionExtension,
              awUrl: data.awUrlExtension,
              highlights: data.highlights?.extension,
            },
    isLoading,
  };
};
