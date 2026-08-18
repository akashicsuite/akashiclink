/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import './theme/variables.css';
import './theme/common.scss';

import { ACEnvironment, getNodePings } from '@akashic/nitr0gen';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactMemoryRouter } from '@ionic/react-router';
import { useEffect } from 'react';

import TrackingConsentManager from './components/analytics/TrackingConsentManager';
import { DepositModalContextProvider } from './components/deposit/deposit-modal-context-provider';
import { SendFormContextProvider } from './components/send/send-modal-context-provider';
import { PopupTree } from './popup/popup-tree';
import { useAppSelector } from './redux/app/hooks';
import { selectTheme } from './redux/slices/preferenceSlice';
import { history } from './routing/history';
import { NavigationTree } from './routing/navigation-tree';
import { themeType } from './theme/const';
import { useIdleTime } from './utils/hooks/useIdleTime';
import { useSetGlobalLanguage } from './utils/hooks/useSetGlobalLanguage';

setupIonicReact();

const env =
  process.env.REACT_APP_ENV === 'prod'
    ? ACEnvironment.MAINNET
    : process.env.REACT_APP_ENV === 'preprod'
      ? ACEnvironment.TESTNET
      : ACEnvironment.STAGING;

const InitializeApp = () => {
  // Initialize language
  useSetGlobalLanguage();

  // Pre-warm the node ping cache on popup open so the first send routes
  // fastest-first instead of falling back to default order. The popup's
  // in-memory cache is lost on close, so warm it each open.
  useEffect(() => {
    void getNodePings(env, true);
  }, []);

  // Initialize theme
  const storedTheme = useAppSelector(selectTheme);
  const toggleDarkTheme = (setDark: boolean) => {
    if (document?.body) {
      document?.body?.classList.toggle('dark', setDark);
      document?.body?.classList.toggle('light', !setDark);
    }
  };

  useEffect(() => {
    toggleDarkTheme(storedTheme === themeType.DARK);
  }, [storedTheme]);

  // Intialize idle timer
  useIdleTime();
};

export default function App() {
  InitializeApp();
  // check if webpage request, if yes skip app and render popup page tree
  const query = new URLSearchParams(window.location.search);
  const type = query.get('type');

  return (
    <IonApp>
      <TrackingConsentManager />
      <IonReactMemoryRouter history={history}>
        <DepositModalContextProvider>
          <SendFormContextProvider>
            {type === 'webPageRequest' && <PopupTree />}
            {type !== 'webPageRequest' && <NavigationTree />}
          </SendFormContextProvider>
        </DepositModalContextProvider>
      </IonReactMemoryRouter>
    </IonApp>
  );
}
