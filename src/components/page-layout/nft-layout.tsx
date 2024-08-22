import './nft-layout.scss';

import { Preferences } from '@capacitor/preferences';
import { IonCol, IonContent, IonPage, IonRow } from '@ionic/react';
import type { ReactNode } from 'react';
import React, { useEffect } from 'react';

import { LAST_HISTORY_ENTRIES } from '../../constants';
import { history } from '../../routing/history';
import { Header } from '../layout/header';
import { AccountNameBar } from '../layout/toolbar/account-name-bar';

export function NftLayout({
  children,
}: {
  children: ReactNode;
  backButton?: boolean;
  noFooter?: boolean;
  backButtonUrl?: string;
}) {
  useEffect(() => {
    const updateLastLocation = async () => {
      await Preferences.set({
        key: LAST_HISTORY_ENTRIES,
        value: JSON.stringify(history.entries),
      });
    };

    updateLastLocation();
  }, [history.entries]);

  return (
    <IonPage>
      <Header />
      <IonContent class="nft-layout">
        <IonRow>
          <IonCol size="12" className="ion-no-padding">
            <AccountNameBar />
          </IonCol>
        </IonRow>
        {children}
      </IonContent>
    </IonPage>
  );
}
