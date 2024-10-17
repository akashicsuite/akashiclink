import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';

import { getManifestJson } from './hooks/useCurrentAppInfo';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Ap-Client': Capacitor.getPlatform(),
  },
  withCredentials: true,
});

instance.interceptors.request.use(async (config) => {
  try {
    const appInfo = await App.getInfo();
    if (appInfo) {
      config.headers['Ap-Version'] = appInfo.version;
    }
  } catch (e) {
    console.warn(e);

    // App.getInfo() does not work on web. Try manifest
    const manifestData = await getManifestJson();
    config.headers['Ap-Version'] = manifestData.version;
  }

  return config;
});

export const axiosBase = instance;
