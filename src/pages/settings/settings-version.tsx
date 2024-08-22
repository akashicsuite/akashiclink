import type { AppInfo } from '@capacitor/app';
import { App } from '@capacitor/app';
import { datadogRum } from '@datadog/browser-rum';
import { IonCol, IonImg, IonRow } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MainGrid } from '../../components/layout/main-grid';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';

export function SettingsVersion() {
  const { t } = useTranslation();

  const [version, setVersion] = useState<string>();
  const [appInfo, setAppInfo] = useState<AppInfo>();

  useEffect(() => {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', '/manifest.json', true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          const manifestData = JSON.parse(xhr.responseText);
          setVersion(manifestData.version);
        } catch (error) {
          datadogRum.addError(error);
        }
      }
    };
    xhr.send(null);
  }, []);

  useEffect(() => {
    const getAppInfo = async () => {
      const appInfo = await App.getInfo();
      setAppInfo(appInfo);
    };

    getAppInfo();
  }, []);

  return (
    <DashboardLayout showSwitchAccountBar>
      <MainGrid style={{ padding: '32px 32px' }}>
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
            <b>{`${appInfo?.name ?? 'AkashicLink'} v${
              appInfo?.version ?? version ?? '-'
            }`}</b>
          </IonCol>
        </IonRow>
      </MainGrid>
    </DashboardLayout>
  );
}
