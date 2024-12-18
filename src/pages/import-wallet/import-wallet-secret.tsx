import styled from '@emotion/styled';
import { IonCol, IonIcon, IonRow, IonText } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../../components/common/alert/alert';
import { PrimaryButton, WhiteButton } from '../../components/common/buttons';
import { MainGrid } from '../../components/layout/main-grid';
import { PublicLayout } from '../../components/page-layout/public-layout';
import { SecretWords } from '../../components/wallet-setup/secret-words';
import { urls } from '../../constants/urls';
import { LINK_TYPE, useI18nInfoUrls } from '../../i18n/links';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  onClear,
  onInputChange,
  reconstructOtkAsync,
  selectError,
  selectImportWalletForm,
} from '../../redux/slices/importWalletSlice';
import { historyGoBackOrReplace } from '../../routing/history';
import { useIosScrollPasswordKeyboardIntoView } from '../../utils/hooks/useIosScrollPasswordKeyboardIntoView';
import { validateSecretPhrase } from '../../utils/otk-generation';
import { unpackRequestErrorMessage } from '../../utils/unpack-request-error-message';

const StyledDiv = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 2px solid var(--ion-color-primary-70);
  border-radius: 8px;
  width: 100%;
  text-align: left;
  color: var(--ion-color-primary-10);
`;
export const ImportWalletSecret = () => {
  useIosScrollPasswordKeyboardIntoView();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const importWalletForm = useAppSelector(selectImportWalletForm);
  const importWalletError = useAppSelector(selectError);
  const infoUrls = useI18nInfoUrls();

  const [alert, setAlert] = useState(formAlertResetState);
  const [isLoading, setIsLoading] = useState(false);

  const isAllFilled = importWalletForm.passPhrase?.every(
    (phrase) => phrase !== ''
  );

  useEffect(() => {
    setAlert(
      importWalletError
        ? errorAlertShell(unpackRequestErrorMessage(importWalletError))
        : formAlertResetState
    );
    // if import failed, release button to let user try again
    setIsLoading(false);
  }, [importWalletError, t]);

  const onConfirmRecoveryPhrase = async () => {
    setIsLoading(true);

    if (
      !importWalletForm.passPhrase ||
      !isAllFilled ||
      !validateSecretPhrase(importWalletForm.passPhrase)
    ) {
      setAlert(errorAlertShell('InvalidSecretPhrase'));
      setIsLoading(false);
      return;
    }

    // user will be redirected to other page if import is successful
    dispatch(reconstructOtkAsync(importWalletForm.passPhrase));
  };

  const onSecretWordsChange = async (values: string[]) => {
    setAlert(formAlertResetState);
    dispatch(
      onInputChange({
        passPhrase: values,
      })
    );
  };

  const onCancel = () => {
    dispatch(onClear());
    historyGoBackOrReplace(urls.importWalletSelectMethod);
  };

  return (
    <PublicLayout>
      <MainGrid className={'ion-grid-row-gap-xs ion-no-padding'}>
        <IonRow>
          <IonCol size="12">
            <IonText>
              <h2 className={'ion-margin-top-0'}>
                {t('AccessWalletWithRecoveryPhrase')}
              </h2>
              <p className={'ion-text-align-center'}>
                {t('AkashicWalletCannotRecoverYourPassword')}{' '}
                <a
                  href={infoUrls[LINK_TYPE.QuickGuide]}
                  target={'_blank'}
                  style={{
                    textDecoration: 'none',
                  }}
                  rel="noreferrer"
                >
                  {t('LearnMore')}
                </a>
              </p>
            </IonText>
          </IonCol>
          <IonCol size="12">
            <IonText>
              <p
                className={
                  'ion-text-size-xs ion-text-align-center ion-text-bold'
                }
              >
                {t('TypeSecretPhrase')}
              </p>
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <SecretWords
              inputVisibility={true}
              initialWords={
                importWalletForm.passPhrase ?? new Array(12).fill('')
              }
              disableInput={false}
              onChange={onSecretWordsChange}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <StyledDiv color="var(--ion-color-primary-10)">
              <IonIcon
                className={'ion-text-size-xxl'}
                src="shared-assets/images/alert.svg"
              />
              <IonText>
                <h5
                  style={{ textAlign: 'left' }}
                  className="ion-no-margin ion-text-size-xs"
                >
                  {t('PasteYourSecretPhrase')}
                </h5>
              </IonText>
            </StyledDiv>
          </IonCol>
          {alert.visible && (
            <IonCol size="12">
              <AlertBox state={alert} />
            </IonCol>
          )}
        </IonRow>
        <IonRow className={'ion-grid-row-gap-xxs'}>
          <IonCol size="6">
            <PrimaryButton
              expand="block"
              disabled={!isAllFilled || alert.visible}
              onClick={onConfirmRecoveryPhrase}
              isLoading={isLoading}
            >
              {t('Confirm')}
            </PrimaryButton>
          </IonCol>
          <IonCol size="6">
            <WhiteButton disabled={isLoading} expand="block" onClick={onCancel}>
              {t('Cancel')}
            </WhiteButton>
          </IonCol>
        </IonRow>
      </MainGrid>
    </PublicLayout>
  );
};
