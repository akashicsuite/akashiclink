import styled from '@emotion/styled';
import { IonCol, IonIcon, IonRow, IonText } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  errorAlertShell,
  formAlertResetState,
} from '../../components/common/alert/alert';
import { PrimaryButton, WhiteButton } from '../../components/common/buttons';
import { MainGrid } from '../../components/layout/main-grid';
import { PublicLayout } from '../../components/page-layout/public-layout';
import { SecretWords } from '../../components/wallet-setup/secret-words';
import { urls } from '../../constants/urls';
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

const StyledSpan = styled.span({
  fontSize: '12px',
  textAlign: 'center',
  color: 'var(--ion-color-primary-10)',
});
const StyledDiv = styled.div`
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 2px solid var(--ion-color-primary-70);
  border-radius: 8px;
  width: 100%;
  text-align: center;
`;
export const ImportWalletSecret = () => {
  useIosScrollPasswordKeyboardIntoView();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const importWalletForm = useAppSelector(selectImportWalletForm);
  const importWalletError = useAppSelector(selectError);

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
  }, [importWalletError, t]);

  const onConfirmRecoveryPhrase = async () => {
    setIsLoading(true);

    if (
      !isAllFilled ||
      typeof importWalletForm.passPhrase === 'undefined' ||
      !validateSecretPhrase(importWalletForm.passPhrase)
    ) {
      setAlert(errorAlertShell('InvalidSecretPhrase'));
      return;
    }

    try {
      dispatch(reconstructOtkAsync(importWalletForm.passPhrase));
    } catch (e) {
      setAlert(
        errorAlertShell(
          importWalletError?.message ||
            (e as Error).message ||
            'GenericFailureMsg'
        )
      );
    }

    setIsLoading(false);
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
      <MainGrid className={'ion-grid-row-gap-lg ion-no-padding'}>
        <IonRow>
          <IonCol size="12">
            <IonText>
              <h2 className={'ion-margin-top-0'}>
                {t('AccessWalletWithRecoveryPhrase')}
              </h2>
              <p className={'ion-text-align-center'}>
                {t('AkashicWalletCannotRecoverYourPassword')}{' '}
                <a
                  href="https://akashic-1.gitbook.io/akashicwallet/"
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
        </IonRow>
        <IonRow
          className="ion-padding-bottom"
          style={{ justifyContent: 'center' }}
        >
          <StyledSpan style={{ fontWeight: '700' }}>
            {t('TypeSecretPhrase')}
          </StyledSpan>
        </IonRow>
        <IonRow>
          <SecretWords
            inputVisibility={true}
            initialWords={importWalletForm.passPhrase ?? new Array(12).fill('')}
            disableInput={false}
            onChange={onSecretWordsChange}
          />
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <StyledDiv color="var(--ion-color-primary-10)">
              <IonIcon
                src="shared-assets/images/alert.svg"
                style={{ fontSize: '14px' }}
              />
              <IonText>
                <h5 className="ion-no-margin ion-text-size-xxs">
                  {t('PasteYourSecretPhrase')}
                </h5>
              </IonText>
            </StyledDiv>
          </IonCol>
        </IonRow>
        {alert.visible && (
          <IonRow>
            <IonCol size="12">
              <StyledDiv
                style={{
                  justifyContent: 'center',
                  border: '1px solid #DE3730',
                  display: 'flex',
                  color: 'var(--ion-color-danger)',
                }}
              >
                {t(alert.message)}
              </StyledDiv>
            </IonCol>
          </IonRow>
        )}
        <IonRow className="ion-grid-column-gap-lg">
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
            <WhiteButton expand="block" onClick={onCancel}>
              {t('Cancel')}
            </WhiteButton>
          </IonCol>
        </IonRow>
      </MainGrid>
    </PublicLayout>
  );
};
