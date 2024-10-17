import { Preferences } from '@capacitor/preferences';
import { IonContent, IonFooter, IonPage } from '@ionic/react';
import { type ReactNode, useEffect } from 'react';

import { LAST_HISTORY_ENTRIES } from '../../constants';
import { history } from '../../routing/history';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { Header } from '../layout/header';
import { AccountNameBar } from '../layout/toolbar/account-name-bar';
import { Toolbar } from '../layout/toolbar/toolbar';

// TODO: move the exported component to a separate file since it is used in other places

export function DashboardLayout({
  children,
  footer,
  showRefresh = false,
  showSwitchAccountBar = false,
  showAddress = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  showRefresh?: boolean;
  showSwitchAccountBar?: boolean;
  showAddress?: boolean;
}) {
  const { authenticated } = useAccountStorage();

  /** If user auth has expired, redirect to login page */
  useEffect(() => {
    const updateLastLocation = async () => {
      if (!authenticated) {
        await Preferences.remove({
          key: LAST_HISTORY_ENTRIES,
        });
      } else {
        await Preferences.set({
          key: LAST_HISTORY_ENTRIES,
          value: JSON.stringify(history.entries),
        });
      }
    };

    updateLastLocation();
  }, [authenticated, history]);

  return (
    <IonPage>
      <Header />
      <IonContent>
        {showSwitchAccountBar && <AccountNameBar />}
        {showAddress && <Toolbar showRefresh={showRefresh} />}
        {children}
      </IonContent>
      {footer && <IonFooter class={'ion-no-border'}>{footer}</IonFooter>}
    </IonPage>
  );
}
