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
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById('root');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

if (!isPlatform('android')) {
  datadogRum.init({
    applicationId: process.env.REACT_APP_DATADOG_APPLICATION_ID || '',
    clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN || '',
    site: 'datadoghq.com',
    service: 'akashic-wallet',
    env: process.env.REACT_APP_ENV || '',
    allowedTracingUrls: [`${process.env.REACT_APP_API_BASE_URL}/api`],

    // Specify a version number to identify the deployed version of your application in Datadog
    version: '0.0.1',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  });

  datadogRum.startSessionReplayRecording();
}

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
