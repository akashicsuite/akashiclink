import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../components/common/buttons';
import { DashboardLayout } from '../components/page-layout/dashboard-layout';
import { historyResetStackAndRedirect } from '../routing/history';

export const ErrorPage = () => {
  const { t } = useTranslation();

  const onClick = () => {
    historyResetStackAndRedirect();
  };

  return (
    <DashboardLayout>
      <IonGrid>
        <IonRow>
          <IonCol size="12" className="ion-text-center">
            <IonText>
              <h2>{t('ErrorPageHeading')}</h2>
            </IonText>
          </IonCol>
          <IonCol size="12" className="ion-text-center">
            <IonText>
              <p>{t('ErrorPageDesc')}</p>
            </IonText>
          </IonCol>
          <IonCol size="12" className="ion-text-center">
            <PrimaryButton onClick={onClick}>
              {t('ErrorPageBackButton')}
            </PrimaryButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </DashboardLayout>
  );
};
