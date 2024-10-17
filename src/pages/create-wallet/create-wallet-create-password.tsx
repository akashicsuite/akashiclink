import { datadogRum } from '@datadog/browser-rum';
import { userConst } from '@helium-pay/backend';
import { useEffect, useState } from 'react';

import {
  errorAlertShell,
  formAlertResetState,
} from '../../components/common/alert/alert';
import { CreatePasswordForm } from '../../components/wallet-setup/create-password-form';
import { urls } from '../../constants/urls';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  onClear,
  onInputChange,
  selectCreateWalletForm,
} from '../../redux/slices/createWalletSlice';
import {
  historyGoBackOrReplace,
  historyResetStackAndRedirect,
} from '../../routing/history';
import { useIosScrollPasswordKeyboardIntoView } from '../../utils/hooks/useIosScrollPasswordKeyboardIntoView';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';

export function CreateWalletPassword() {
  useIosScrollPasswordKeyboardIntoView();
  const createWalletForm = useAppSelector(selectCreateWalletForm);
  const dispatch = useAppDispatch();
  const [alert, setAlert] = useState(formAlertResetState);
  const { authenticated } = useAccountStorage();

  /** Tracking user input */
  const validatePassword = (value: string) =>
    !!value.match(userConst.passwordRegex);
  const validateConfirmPassword = (value: string) =>
    createWalletForm.password === value;

  /**
   * Validates Password, creates OTK and sends on to OTK-confirmation (Create)
   * OR, for import validates password, stores OTK and send sto Success-screen
   */
  async function confirmPasswordAndCreateOtk() {
    if (
      !(
        createWalletForm.password &&
        createWalletForm.confirmPassword &&
        createWalletForm.checked
      )
    )
      return;

    const isPasswordValid =
      validateConfirmPassword(createWalletForm.confirmPassword) &&
      validatePassword(createWalletForm.password);

    if (isPasswordValid) {
      try {
        setAlert(formAlertResetState);
        historyResetStackAndRedirect(urls.createWalletSecretPhrase);
      } catch (e) {
        datadogRum.addError(e);
        setAlert(errorAlertShell('GenericFailureMsg'));
      }
    } else {
      setAlert(errorAlertShell('PasswordHelperText'));
    }
  }

  useEffect(() => {
    dispatch(onClear());
  }, []);

  const onClickCancel = () => {
    dispatch(onClear());
    historyGoBackOrReplace(authenticated ? urls.dashboard : urls.akashicPay);
  };

  return (
    <CreatePasswordForm
      form={createWalletForm}
      onInputChange={onInputChange}
      onCancel={onClickCancel}
      onSubmit={confirmPasswordAndCreateOtk}
      alert={alert}
    />
  );
}
