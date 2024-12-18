import type { AppInfo } from '@capacitor/app';
import { App } from '@capacitor/app';
import { datadogRum } from '@datadog/browser-rum';
import axios from 'axios';
import { useEffect, useState } from 'react';

export const getManifestJson = async (): Promise<Record<string, string>> => {
  const response = await axios.get<Record<string, string>>('/manifest.json', {
    data: {}, // workaround for axios
  });
  return response.data;
};

export const useCurrentAppInfo = () => {
  const [version, setVersion] = useState<string>('');
  const [appInfo, setAppInfo] = useState<AppInfo>();

  useEffect(() => {
    const getManifestVersion = async () => {
      try {
        const manifestData = await getManifestJson();

        setVersion(manifestData.version);
      } catch (e) {
        datadogRum.addError(e);
        console.warn(e);
      }
    };

    getManifestVersion();
  }, []);

  useEffect(() => {
    const getAppInfo = async () => {
      try {
        const appInfo = await App.getInfo();
        setAppInfo(appInfo);
      } catch (e) {
        datadogRum.addError(e);
      }
    };

    getAppInfo();
  }, []);

  return {
    name: appInfo?.name ?? 'AkashicLink',
    version: appInfo?.version ?? version,
  };
};
