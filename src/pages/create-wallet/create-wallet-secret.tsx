import { IonCol, IonRow, IonText } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../../components/common/alert/alert';
import { PrimaryButton } from '../../components/common/buttons';
import { ContactSupportText } from '../../components/common/text/contact-support-text';
import { MainGrid } from '../../components/layout/main-grid';
import { PublicLayout } from '../../components/page-layout/public-layout';
import { SecretWords } from '../../components/wallet-setup/secret-words';
import { urls } from '../../constants/urls';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  generateOtkAsync,
  selectError,
  selectOtk,
} from '../../redux/slices/createWalletSlice';
import { historyReplace } from '../../routing/history';
import { useIosScrollPasswordKeyboardIntoView } from '../../utils/hooks/useIosScrollPasswordKeyboardIntoView';

export function CreateWalletSecret() {
  useIosScrollPasswordKeyboardIntoView();
  const { t } = useTranslation();

  const otk = useAppSelector(selectOtk);
  const createWalletError = useAppSelector(selectError);
  const dispatch = useAppDispatch();

  const [alert, setAlert] = useState(formAlertResetState);
  const [isDisable, setIsDisable] = useState(true);

  useEffect(() => {
    if (!otk) {
      dispatch(generateOtkAsync(0));
    }
  }, [otk]);

  useEffect(() => {
    setAlert(
      createWalletError
        ? errorAlertShell('GenericFailureMsg')
        : formAlertResetState
    );
  }, [createWalletError, t]);

  const onConfirmSecret = () => {
    historyReplace(urls.createWalletSecretPhraseConfirm);
  };

  return (
    <PublicLayout className="vertical-center">
      <MainGrid className={'ion-no-padding'}>
        <IonRow className={'ion-center ion-grid-row-gap-xs'}>
          <IonCol size="11">
            <IonText className={'ion-text-size-xs'} color={'dark'}>
              <h2
                className={
                  'ion-text-align-center ion-text-size-xl ion-margin-bottom-xxs ion-margin-top-0'
                }
              >
                {t('WriteSecretRecoveryPhrase')}
              </h2>
              <p className={'ion-text-align-center'}>
                {t('Store12SecretRecoveryPhrase')}
              </p>
            </IonText>
          </IonCol>
          <IonCol size={'11'}>
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
            {otk?.phrase && (
              <SecretWords
                initialWords={otk.phrase.split(' ')}
                withAction={true}
                onHiddenChange={(isSecretPhraseHidden: boolean) => {
                  setIsDisable(isSecretPhraseHidden);
                }}
              />
            )}
          </IonCol>
        </IonRow>
        {alert?.visible && (
          <IonRow>
            <IonCol size="12">
              <AlertBox state={alert} />
            </IonCol>
          </IonRow>
        )}
        <IonRow className={'ion-justify-content-center ion-grid-row-gap-xxs'}>
          <IonCol size="6">
            <PrimaryButton
              expand="block"
              disabled={isDisable}
              onClick={onConfirmSecret}
            >
              {t('Next')}
            </PrimaryButton>
          </IonCol>
        </IonRow>
        <ContactSupportText />
      </MainGrid>
    </PublicLayout>
  );
}
