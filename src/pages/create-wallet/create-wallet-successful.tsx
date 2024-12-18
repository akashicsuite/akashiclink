import styled from '@emotion/styled';
import { IonCol, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../../components/common/buttons';
import { SuccessfulIconWithTitle } from '../../components/common/state-icon-with-title/successful-icon-with-title';
import { MainGrid } from '../../components/layout/main-grid';
import { PublicLayout } from '../../components/page-layout/public-layout';
import { LINK_TYPE, useI18nInfoUrls } from '../../i18n/links';
import { useAppDispatch } from '../../redux/app/hooks';
import { onClear } from '../../redux/slices/createWalletSlice';
import { historyResetStackAndRedirect } from '../../routing/history';

export const StyledA = styled.a({
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--ion-color-primary)',
  marginTop: '4px',
  lineHeight: '16px',
  cursor: 'pointer',
  textDecoration: 'none',
});

export const CreateWalletSuccessful = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const infoUrls = useI18nInfoUrls();

  const handleOnConfirm = async () => {
    dispatch(onClear());
    // creation flow is finished, completely reset router history
    await historyResetStackAndRedirect();
  };

  return (
    <PublicLayout className="vertical-center">
      <MainGrid className={'ion-grid-row-gap-md'}>
        <IonRow className={'ion-center'}>
          <IonCol size={'12'}>
            <SuccessfulIconWithTitle title={t('WalletCreationSuccessful')} />
            <IonText color={'dark'}>
              <p className={'ion-text-align-center ion-text-size-xs'}>
                {t('WalletProtectedSuccessfully')}
              </p>
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow className={'ion-center ion-grid-row-gap-xs'}>
          <IonCol size={'12'}>
            <h3 className={'ion-text-align-center ion-margin-bottom-sm'}>
              {t('Remember')}
            </h3>
            <IonText className={'ion-text-size-xs'} color={'dark'}>
              <ul>
                <li>{t('CantRecoverSecretPhrase')}</li>
                <li>{t('WillNeverAskRecoveryPhrase')}</li>
                <li>
                  <b>{t('NeverShareRecoveryPhrase')}</b> {t('riskOfFunds')}
                </li>
                <li>
                  <StyledA
                    href={infoUrls[LINK_TYPE.QuickGuide]}
                    target={'_blank'}
                  >
                    {t('LearnMore')}
                  </StyledA>
                </li>
              </ul>
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow className={'ion-center'}>
          <IonCol size={'6'}>
            <PrimaryButton expand="block" onClick={handleOnConfirm}>
              {t('GotIt')}
            </PrimaryButton>
          </IonCol>
        </IonRow>
      </MainGrid>
    </PublicLayout>
  );
};
