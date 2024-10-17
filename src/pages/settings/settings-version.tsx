import { IonCol, IonImg, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { MainGrid } from '../../components/layout/main-grid';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { useCurrentAppInfo } from '../../utils/hooks/useCurrentAppInfo';

export function SettingsVersion() {
  const { t } = useTranslation();
  const info = useCurrentAppInfo();

  return (
    <DashboardLayout showSwitchAccountBar>
      <MainGrid className="ion-padding-top-xl ion-padding-bottom-xl ion-padding-left-xl ion-padding-right-xl">
        <IonRow>
          <IonCol size={'12'}>
            <h2>{t('AboutUs')}</h2>
          </IonCol>
        </IonRow>
        <IonRow
          className={
            'ion-justify-content-center ion-align-items-center ion-grid-row-gap-xs'
          }
        >
          <IonCol size={'2'}>
            <IonImg
              alt={''}
              src={'/shared-assets/images/about-us-aw-logo.svg'}
              style={{ height: '100%' }}
            />
          </IonCol>
          <IonCol size={'12'} class="ion-center">
            <b>{`${info?.name ?? 'AkashicLink'} v${info?.version ?? '-'}`}</b>
          </IonCol>
        </IonRow>
      </MainGrid>
    </DashboardLayout>
  );
}
