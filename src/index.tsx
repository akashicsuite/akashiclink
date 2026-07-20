import './i18n/i18n';

import { datadogRum } from '@datadog/browser-rum';
import { isPlatform } from '@ionic/react';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import App from './App';
import { store } from './redux/app/store';
import { reportWebVitals } from './reportWebVitals';
import { history } from './routing/history';
import { getManifestJson } from './utils/hooks/useCurrentAppInfo';

const container = document.getElementById('root');

const root = createRoot(container!);

const initDatadog = async () => {
  let version = '';

  try {
    // App.getInfo() does not work on web. Try manifest
    const manifestData = await getManifestJson();
    version = manifestData.version;
  } catch (e) {
    console.warn(e);
  }

  if (!isPlatform('android')) {
    datadogRum.init({
      applicationId: process.env.REACT_APP_DATADOG_APPLICATION_ID || '',
      clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN || '',
      site: 'datadoghq.com',
      service: 'akashic-wallet',
      env: process.env.REACT_APP_ENV || '',
      allowedTracingUrls: [`${process.env.REACT_APP_API_BASE_URL}`],

      // Specify a version number to identify the deployed version of your application in Datadog
      version,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    });

    datadogRum.startSessionReplayRecording();
  }
};

initDatadog();

const persistor = persistStore(store);
root.render(
  <React.StrictMode>
    {/* Providers should be placed in App.tsx for consistency */}
    {/* Except for below redux providers */}
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
