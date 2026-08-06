import { KeyError } from '@akashic/as-backend';
import { datadogRum } from '@datadog/browser-rum';
import { IonCol, IonRow } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../constants/urls';
import { historyResetStackAndRedirect } from '../../routing/history';
import { OwnersAPI } from '../../utils/api';
import { getErrorMessageTKey } from '../../utils/error-utils';
import { useIosScrollPasswordKeyboardIntoView } from '../../utils/hooks/useIosScrollPasswordKeyboardIntoView';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { verifyKeyHealth } from '../../utils/otk-generation';
import { AccountSelection } from '../account-selection/account-selection';
import {
  CustomAlert,
  errorAlertShell,
  formAlertResetState,
} from '../common/alert/alert';
import { PrimaryButton } from '../common/buttons';
import { StyledInput } from '../common/input/styled-input';
import { Spinner } from '../common/loader/spinner';
import { ForgotYourPasswordButton } from './forgot-your-password-button';

/**
 * Form allowing user to login
 * - Dropdown box showing user the locally imported accounts
 * - Password box
 * - Upload button triggering login request and redirect is successfull
 */
export function LoginForm({ isPopup = false }) {
  const { getLocalOtkAndCache, setCacheOtk } = useAccountStorage();
  const { t } = useTranslation();
  const [alert, setAlert] = useState(formAlertResetState);
  const [isLoading, setIsLoading] = useState(false);

  const {
    localAccounts,
    addPrefixToAccounts,
    activeAccount,
    setActiveAccount,
  } = useAccountStorage();
  const [password, setPassword] = useState<string>('');

  addPrefixToAccounts();
  useIosScrollPasswordKeyboardIntoView();

  // fallback to the first wallet available if user delete logged in wallet
  useEffect(() => {
    if (!activeAccount && localAccounts?.[0]) {
      setActiveAccount(localAccounts?.[0]);
    }
  }, [activeAccount?.identity, localAccounts?.length]);

  const onClickLogin = async () => {
    try {
      setAlert(formAlertResetState);
      setIsLoading(true);

      if (!activeAccount || !password) {
        setAlert(errorAlertShell('ValidationError'));
        return;
      }

      const localSelectedOtk = await getLocalOtkAndCache({
        identity: activeAccount.identity,
        otkType: activeAccount.otkType,
        publicKey: activeAccount.publicKey,
        password,
      });

      if (!localSelectedOtk) {
        throw new Error(
          `localSelectedOtk not found for account ${activeAccount.identity}. This may be due to an unmigrated legacy account.`
        );
      }

      // Guard against expired / invalid keys before entering the app:
      //  1. Self-signature test — the decrypted key pair is internally
      //     consistent (catches a locally corrupted key).
      //  2. Active-OTK check — the key is still in its owner's active key list
      //     on chain (AC). A removed/revoked OTK keeps a valid local key pair
      //     (so it passes the self-signature test) and is never deleted from
      //     the immutable chain, so the identity's live authorities list on
      //     chain is the only source of truth for whether it is still
      //     authorized.
      // Either failure clears the cached OTK and surfaces the error here
      // instead of letting the user proceed to the app.
      const isKeyValid =
        verifyKeyHealth(localSelectedOtk) &&
        (await OwnersAPI.verifyOtkActive(
          activeAccount.identity,
          localSelectedOtk.key.pub.pkcs8pem
        ));

      if (!isKeyValid) {
        setCacheOtk(null);
        throw new Error(KeyError.invalidPrivateKey);
      }

      datadogRum.setUser({
        id: `${activeAccount.identity}-${activeAccount.otkType}-${activeAccount.publicKey?.slice(8) ?? ''}`,
      });

      setPassword('');
      historyResetStackAndRedirect(urls.dashboard, { isManualLogout: false });
    } catch (error) {
      setAlert(errorAlertShell(getErrorMessageTKey(error)));
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) return <Spinner />;

  return (
    <>
      <CustomAlert state={alert} />
      <h1 className="ion-justify-content-center ion-margin-top-lg ion-margin-bottom-xs">
        {t('WelcomeBack')}
      </h1>
      <h3 className="ion-justify-content-center ion-margin-top-0 ion-margin-bottom-md">
        {t('EmpoweringYourWealth')}
      </h3>
      <IonRow className={'ion-grid-gap-xs'}>
        <IonCol size="12">
          <AccountSelection isPopup={isPopup} />
        </IonCol>
        <IonCol size="12">
          <StyledInput
            value={password}
            type={'password'}
            placeholder={t('Password')}
            onIonInput={({ detail: { value } }) => setPassword(value as string)}
            submitOnEnter={onClickLogin}
            enterkeyhint="go"
          />
        </IonCol>
        <IonCol size="12">
          <PrimaryButton
            onClick={onClickLogin}
            style={{ width: '100%' }}
            expand="block"
            disabled={!password}
          >
            {t('Unlock')}
          </PrimaryButton>
        </IonCol>
        <IonCol size="12">
          <ForgotYourPasswordButton />
        </IonCol>
      </IonRow>
    </>
  );
}
