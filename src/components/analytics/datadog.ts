import { datadogRum } from '@datadog/browser-rum';
import { isPlatform } from '@ionic/react';

import { getManifestJson } from '../../utils/hooks/useCurrentAppInfo';

let initialized = false;

export const initDatadog = async () => {
  if (initialized) return;
  if (isPlatform('android')) return;
  if (
    !process.env.REACT_APP_DATADOG_APPLICATION_ID ||
    !process.env.REACT_APP_DATADOG_CLIENT_TOKEN
  )
    return;
  if (
    process.env.REACT_APP_ENV === 'dev' &&
    !process.env.REACT_APP_DEBUG_TRACKING
  )
    return;

  let version = '';
  try {
    const manifestData = await getManifestJson();
    version = manifestData.version;
  } catch (e) {
    console.warn(e);
  }

  datadogRum.init({
    applicationId: process.env.REACT_APP_DATADOG_APPLICATION_ID,
    clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'akashic-wallet',
    env: process.env.REACT_APP_ENV || '',
    allowedTracingUrls: [`${process.env.REACT_APP_API_BASE_URL}`],
    version,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    trackingConsent: 'not-granted',
  });
  datadogRum.startSessionReplayRecording();
  initialized = true;
};

export const acceptConsentDatadog = () => {
  datadogRum.setTrackingConsent?.('granted');
};
export const denyConsentDatadog = () => {
  datadogRum.setTrackingConsent?.('not-granted');
};
