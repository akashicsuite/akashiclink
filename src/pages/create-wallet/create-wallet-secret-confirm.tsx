import { datadogRum } from '@datadog/browser-rum';
import styled from '@emotion/styled';
import { IonCol, IonRow, IonText } from '@ionic/react';
import axios from 'axios';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../../components/common/alert/alert';
import { PrimaryButton, WhiteButton } from '../../components/common/buttons';
import { Spinner } from '../../components/common/loader/spinner';
import { ContactSupportText } from '../../components/common/text/contact-support-text';
import { MainGrid } from '../../components/layout/main-grid';
import { PublicLayout } from '../../components/page-layout/public-layout';
import { SecretWords } from '../../components/wallet-setup/secret-words';
import { urls } from '../../constants/urls';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  onClear,
  onClearOtk,
  onInputChange,
  selectCreateWalletForm,
  selectMaskedPassPhrase,
  selectOtk,
} from '../../redux/slices/createWalletSlice';
import {
  historyReplace,
  historyResetStackAndRedirect,
} from '../../routing/history';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { createAccountWithKeys } from './akashic-chain-interaction';

export const StyledSpan = styled.span({
  fontSize: '12px',
  fontWeight: '400',
  color: 'var(--ion-color-primary-10)',
  marginTop: '4px',
  lineHeight: '16px',
});

export function CreateWalletSecretConfirm({ isPopup = false }) {
  const { t } = useTranslation();
  const otk = useAppSelector(selectOtk);
  const createWalletForm = useAppSelector(selectCreateWalletForm);
  const maskedPassPhrase = useAppSelector(selectMaskedPassPhrase);
  const dispatch = useAppDispatch();

  const [alert, setAlert] = useState(formAlertResetState);

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const { addLocalAccount, setActiveAccount, addLocalOtkAndCache } =
    useAccountStorage();

  useEffect(() => {
    // Redirect user to login if soft close during create wallet request
    if (!isCreatingAccount && !otk && !alert.visible) {
      historyResetStackAndRedirect(urls.akashicPay);
    }
    // losing Password in the previous step would never allow user to go forward again,
    // redirect user back to login page
    if (!createWalletForm.password || !createWalletForm.confirmPassword) {
      dispatch(onClear());
      historyResetStackAndRedirect(urls.akashicPay);
    }
  }, [otk, isCreatingAccount]);

  async function activateWalletAccount() {
    // Submit request and display "creating account loader"
    try {
      // Check for correct 12-word confirmation
      if (
        !createWalletForm.confirmPassPhrase ||
        !otk?.phrase ||
        !isEqual(
          createWalletForm.confirmPassPhrase.join(' '),
          otk.phrase.trim()
        )
      ) {
        throw new Error(t('InvalidSecretPhrase'));
      }

      // losing Password would never allow user to go forward again, redirect user back to login page
      if (!otk || !createWalletForm.password) {
        dispatch(onClear());
        historyResetStackAndRedirect(urls.akashicPay);
        return;
      }
      setIsCreatingAccount(true);

      // all checks are passed, immediately clear otk so otk is not reusable
      dispatch(onClearOtk());

      const { otk: fullOtk } = await createAccountWithKeys(otk);

      // Set new account details and display summary screen
      const newAccount = {
        identity: fullOtk.identity,
      };

      addLocalOtkAndCache(fullOtk, createWalletForm.password);
      addLocalAccount(newAccount);
      setAlert(formAlertResetState);
      setActiveAccount(newAccount);

      if (isPopup) {
        dispatch(onClear());
      }

      historyResetStackAndRedirect(urls.createWalletSuccessful);
    } catch (e) {
      datadogRum.addError(e);
      const error = e as Error;
      let message = error.message || 'GenericFailureMsg';
      if (axios.isAxiosError(e)) message = e.response?.data?.message || message;
      setAlert(errorAlertShell(message));
      setIsCreatingAccount(false);
    }
  }

  const onGoBack = () => {
    historyReplace(urls.createWalletSecretPhrase);
  };

  return (
    <PublicLayout className="vertical-center">
      {isCreatingAccount && (
        <Spinner header={'CreatingYourWallet'} warning={'DoNotClose'} />
      )}
      <MainGrid style={{ padding: 0 }}>
        <IonRow className={'ion-grid-column-gap-0'}>
          <IonCol size="12" style={{ textAlign: 'center' }}>
            <h2
              className={
                'ion-text-align-center ion-text-size-xl ion-margin-bottom-xxs'
              }
            >
              {t('ConfirmSecretRecovery')}
            </h2>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size={'12'}>
            <IonText className={'ion-text-size-xs'} color={'dark'}>
              <h3 className={'ion-text-align-center ion-margin-0'}>
                {t('Important')}
              </h3>
              <p
                className={
                  'ion-text-align-center ion-margin-top-xxs ion-text-bold ion-text-size-xxs'
                }
              >
                {t('SaveBackUpSecureLocation')}
              </p>
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow className={'ion-grid-row-gap-xxs'}>
          <IonCol size={'12'}>
            <SecretWords
              initialWords={maskedPassPhrase}
              withAction={false}
              onChange={(value) => {
                dispatch(
                  onInputChange({
                    confirmPassPhrase: value,
                  })
                );
                setAlert(formAlertResetState);
              }}
            />
          </IonCol>
        </IonRow>
        {alert.visible && (
          <IonRow>
            <IonCol size="12">
              <AlertBox state={alert} />
            </IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol size="6">
            <PrimaryButton
              expand="block"
              onClick={() => activateWalletAccount()}
            >
              {t('Confirm')}
            </PrimaryButton>
          </IonCol>
          <IonCol size="6">
            <WhiteButton expand="block" fill="clear" onClick={onGoBack}>
              {t('GoBack')}
            </WhiteButton>
          </IonCol>
        </IonRow>
        <ContactSupportText />
      </MainGrid>
    </PublicLayout>
  );
}
