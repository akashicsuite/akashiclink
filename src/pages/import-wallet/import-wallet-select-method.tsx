import { IonCol, IonIcon, IonRow, IonText } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import {
  PrimaryButton,
  SquareWhiteButton,
  WhiteButton,
} from '../../components/common/buttons';
import { MainGrid } from '../../components/layout/main-grid';
import { PublicLayout } from '../../components/page-layout/public-layout';
import { urls } from '../../constants/urls';
import { historyGoBackOrReplace } from '../../routing/history';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';

export const ImportWalletSelectMethod = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { authenticated } = useAccountStorage();

  const onBackButton = () => {
    historyGoBackOrReplace(authenticated ? urls.dashboard : urls.akashicPay);
  };
  const onSelectKeyPair = () => {
    history.push(akashicPayPath(urls.importWalletKeypair));
  };
  const onSelect12Words = () => {
    history.push(akashicPayPath(urls.importWalletSecretPhrase));
  };

  return (
    <PublicLayout>
      <SquareWhiteButton className="icon-button" onClick={onBackButton}>
        <IonIcon
          className="icon-button-icon"
          slot="icon-only"
          icon={arrowBack}
        />
      </SquareWhiteButton>
      <MainGrid style={{ padding: '80px 16px' }}>
        <IonRow className={'ion-grid-row-gap-md'}>
          <IonCol size="12" style={{ textAlign: 'center' }}>
            <h2 className={'ion-margin-bottom-xxs ion-margin-top-0'}>
              {t('ImportWallet')}
            </h2>
            <IonText
              className={
                'ion-text-align-center ion-text-size-xs ion-margin-bottom-lg'
              }
              color={'dark'}
            >
              {t('PleaseChooseSecurityOptionToImportWallet')}
            </IonText>
          </IonCol>
          <IonCol size="12" style={{ textAlign: 'center' }}>
            <IonRow className={'ion-grid-row-gap-xs'}>
              <IonCol size="12" style={{ textAlign: 'center' }}>
                <PrimaryButton expand="block" onClick={onSelect12Words}>
                  {t('12Words')}
                </PrimaryButton>
              </IonCol>
              <IonCol size="12" style={{ textAlign: 'center' }}>
                <WhiteButton
                  expand="block"
                  fill="clear"
                  onClick={onSelectKeyPair}
                >
                  {t('KeyPair')}
                </WhiteButton>
              </IonCol>
            </IonRow>
          </IonCol>
        </IonRow>
      </MainGrid>
    </PublicLayout>
  );
};
