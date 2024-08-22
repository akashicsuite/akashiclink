import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { AlertBox } from '../../components/common/alert/alert';
import { CopyBox } from '../../components/common/copy-box';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import {
  PageHeader,
  SettingsWrapper,
} from '../../components/settings/base-components';
import { ConfirmLockPassword } from '../../components/settings/confirm-lock-password';
import type { FullOtk } from '../../utils/otk-generation';

export enum BackupKeyPairState {
  ConfirmPassword,
  ViewKeyPair,
}

export function SettingsBackup() {
  const { t } = useTranslation();
  const history = useHistory();

  const [view, setView] = useState(BackupKeyPairState.ConfirmPassword);
  const [keyPair, setKeyPair] = useState('');

  const onPasswordCheckSuccess = (otk: FullOtk) => {
    setKeyPair(otk.key.prv.pkcs8pem);
    setView(BackupKeyPairState.ViewKeyPair);
  };

  useEffect(() => {
    setView(BackupKeyPairState.ConfirmPassword);
  }, [history.location]);

  return (
    <DashboardLayout showSwitchAccountBar>
      {view === BackupKeyPairState.ConfirmPassword && (
        <ConfirmLockPassword onPasswordCheckSuccess={onPasswordCheckSuccess} />
      )}
      {view === BackupKeyPairState.ViewKeyPair && (
        <SettingsWrapper>
          <PageHeader>{t('ThisIsYourKeyPair')}</PageHeader>
          <IonGrid fixed className="ion-no-padding">
            <IonRow className={'ion-grid-row-gap-sm'}>
              <IonCol>
                <CopyBox label="" text={keyPair} />
              </IonCol>
              <IonCol class="ion-center">
                <AlertBox
                  state={{
                    visible: true,
                    success: false,
                    message: t('KeyPairWarning'),
                  }}
                />
              </IonCol>
            </IonRow>
          </IonGrid>
        </SettingsWrapper>
      )}
    </DashboardLayout>
  );
}
