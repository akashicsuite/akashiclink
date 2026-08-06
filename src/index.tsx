import './i18n/i18n';

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

const container = document.getElementById('root');
const root = createRoot(container!);
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
