import { IonContent, IonFooter, IonPage } from '@ionic/react';
import { type ReactNode, useEffect } from 'react';

import { LAST_HISTORY_ENTRIES } from '../../constants';
import { history } from '../../routing/history';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import { AnnouncementAlert } from '../layout/announcement-alert';
import { Header } from '../layout/header';
import { NavigationTabs } from '../layout/navigation-tabs';
import { VersionUpdateAlert } from '../layout/version-update-alert';

export function DashboardLayout({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { authenticated } = useAccountStorage();
  const { setValue, removeValue } = useLocalStorage(LAST_HISTORY_ENTRIES);

  /** If user auth has expired, redirect to login page */
  useEffect(() => {
    const updateLastLocation = async () => {
      if (!authenticated) {
        removeValue();
      } else {
        setValue(history.entries);
      }
    };

    updateLastLocation();
  }, [authenticated, history]);

  return (
    <IonPage style={{ maxWidth: 600, margin: '0 auto' }}>
      <Header />
      <IonContent>{children}</IonContent>
      {footer && <IonFooter class={'ion-no-border'}>{footer}</IonFooter>}
      {process.env.REACT_APP_SKIP_UPDATE_CHECK !== 'true' && (
        <VersionUpdateAlert />
      )}
      <AnnouncementAlert messageKey={'ServiceTerminationMessage'} />
      <NavigationTabs />
    </IonPage>
  );
}
