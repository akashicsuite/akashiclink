import { userConst } from '@helium-pay/backend';
import { useState } from 'react';

import { CreatePasswordForm } from '../../components/wallet-setup/create-password-form';
import { urls } from '../../constants/urls';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  onClear as onClearImportWalletSlice,
  onInputChange,
  selectImportWalletForm,
  selectOtk,
} from '../../redux/slices/importWalletSlice';
import {
  historyGoBackOrReplace,
  historyResetStackAndRedirect,
} from '../../routing/history';
import { EXTENSION_EVENT, responseToSite } from '../../utils/chrome';
import { useIosScrollPasswordKeyboardIntoView } from '../../utils/hooks/useIosScrollPasswordKeyboardIntoView';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useLogout } from '../../utils/hooks/useLogout';

export function ImportWalletPassword({ isPopup = false }) {
  useIosScrollPasswordKeyboardIntoView();

  const logout = useLogout();

  const [isLoading, setIsLoading] = useState(false);
  /** Tracking user input */
  const validatePassword = (value: string) =>
    !!RegExp(userConst.passwordRegex).exec(value);
  const { addLocalOtkAndCache, addLocalAccount, setActiveAccount } =
    useAccountStorage();
  const importWalletForm = useAppSelector(selectImportWalletForm);
  const otk = useAppSelector(selectOtk);
  const dispatch = useAppDispatch();
  const validateConfirmPassword = (value: string) =>
    importWalletForm.password === value;

  /**
   * Validates Password, creates OTK and sends on to OTK-confirmation (Create)
   * OR, for import validates password, stores OTK and send to Success-screen
   */
  async function confirmPasswordAndCreateOtk() {
    if (
      !(
        importWalletForm.password &&
        importWalletForm.confirmPassword &&
        importWalletForm.checked
      )
    ) {
      return;
    }
    setIsLoading(true);
    const isPasswordValid =
      validateConfirmPassword(importWalletForm.confirmPassword) &&
      validatePassword(importWalletForm.password);

    if (!isPasswordValid) {
      setIsLoading(false);
      return;
    }

    if (isPasswordValid && otk?.identity) {
      // call import api and store the Identity.
      // added local otk
      addLocalOtkAndCache(otk, importWalletForm.password);
      // need to add local account
      addLocalAccount({
        identity: otk.identity,
      });

      setActiveAccount({
        identity: otk.identity,
      });

      if (isPopup) {
        dispatch(onClearImportWalletSlice());
        historyResetStackAndRedirect(urls.importWalletSuccessful);
        return;
      } else {
        await responseToSite({
          event: EXTENSION_EVENT.USER_LOCKED_WALLET,
        });
      }

      setIsLoading(false);
      historyResetStackAndRedirect(urls.importWalletSuccessful);
    }
  }

  const onClickCancel = async () => {
    dispatch(onClearImportWalletSlice());
    if (isPopup) {
      historyGoBackOrReplace(urls.root);
    } else {
      await logout();
    }
  };

  return (
    <CreatePasswordForm
      form={importWalletForm}
      isLoading={isLoading}
      onInputChange={onInputChange}
      onCancel={onClickCancel}
      onSubmit={confirmPasswordAndCreateOtk}
    />
  );
}
