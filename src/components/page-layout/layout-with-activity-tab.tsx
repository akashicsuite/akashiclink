import './layout-with-activity-tab.scss';

import { IonCol, IonGrid, IonRow, IonSpinner } from '@ionic/react';
import type { ReactNode } from 'react';

import { ActivityAndNftTab } from '../layout/activity-and-nft-tab';
import { DashboardLayout } from './dashboard-layout';

export function LayoutWithActivityTab({
  children,
  loading = false,
  showRefresh = true,
}: {
  children: ReactNode;
  loading?: boolean;
  showRefresh?: boolean;
}) {
  return (
    <DashboardLayout showRefresh={showRefresh} showAddress showSwitchAccountBar>
      {loading && (
        <IonGrid>
          <IonRow class="ion-justify-content-center ion-margin-vertical">
            <IonCol size="auto" class="ion-margin-vertical">
              <IonSpinner name="circular"></IonSpinner>
            </IonCol>
          </IonRow>
        </IonGrid>
      )}
      {!loading && children}
      <ActivityAndNftTab />
    </DashboardLayout>
  );
}
