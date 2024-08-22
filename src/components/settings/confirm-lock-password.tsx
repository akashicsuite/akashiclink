import { datadogRum } from '@datadog/browser-rum';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIosScrollPasswordKeyboardIntoView } from '../../utils/hooks/useIosScrollPasswordKeyboardIntoView';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import type { FullOtk } from '../../utils/otk-generation';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../common/alert/alert';
import { PrimaryButton } from '../common/buttons';
import { StyledInput } from '../common/input/styled-input';
import { SettingsWrapper } from './base-components';

/**
 * Initiates a confirmation procedure using supplied method
 *
 * @param setVal callback to initiate requres to backend with the signed password
 */
export function ConfirmLockPassword({
  onPasswordCheckSuccess,
}: {
  onPasswordCheckSuccess: (otk: FullOtk) => void;
}) {
  useIosScrollPasswordKeyboardIntoView();
  const { t } = useTranslation();
  const [password, setPassword] = useState<string>();
  const [alert, setAlert] = useState(formAlertResetState);
  const { getLocalOtk, activeAccount } = useAccountStorage();

  // Submit request to display private key - requires password
  const handleOnConfirm = async () => {
    try {
      if (typeof password === 'undefined') {
        setAlert(errorAlertShell('InvalidPassword'));
        return;
      }
      if (!activeAccount) return;
      const otk = await getLocalOtk(activeAccount.identity, password);
      if (otk) {
        onPasswordCheckSuccess(otk);
      } else {
        setAlert(errorAlertShell('PleaseConfirm'));
      }
    } catch (e) {
      datadogRum.addError(e);
      setAlert(errorAlertShell('InvalidPassword'));
    }
  };

  return (
    <SettingsWrapper>
      <div>
        <h2 className="ion-margin-top-xl ion-margin-left-xxs ion-margin-right-xxs">
          {t('KeyPairBackup')}
        </h2>
        <h6 className="ion-margin-top-xs">{t('PleaseEnterYourPassword')}</h6>
      </div>
      <IonGrid fixed className="ion-no-padding">
        <IonRow className={'ion-grid-row-gap-lg'}>
          <IonCol size="12" className="ion-no-padding">
            <StyledInput
              label={t('Password')}
              type="password"
              placeholder={t('PleaseConfirmYourPassword')}
              onIonInput={({ target: { value } }) => {
                setAlert(formAlertResetState);
                setPassword(value as string);
              }}
            />
          </IonCol>
          {alert.visible && (
            <IonCol size="12">
              <AlertBox state={alert} />
            </IonCol>
          )}
        </IonRow>
      </IonGrid>
      <PrimaryButton
        expand="block"
        disabled={!password}
        onClick={handleOnConfirm}
      >
        {t('Confirm')}
      </PrimaryButton>
    </SettingsWrapper>
  );
}
