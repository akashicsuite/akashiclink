import { userConst } from '@helium-pay/backend';
import { useState } from 'react';

import { CreatePasswordForm } from '../../components/wallet-setup/create-password-form';
import { urls } from '../../constants/urls';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  onClear,
  onInputChange,
  selectImportWalletForm,
  selectOtk,
} from '../../redux/slices/importWalletSlice';
import {
  historyGoBackOrReplace,
  historyResetStackAndRedirect,
} from '../../routing/history';
import { useAccountMe } from '../../utils/hooks/useAccountMe';
import { useIosScrollPasswordKeyboardIntoView } from '../../utils/hooks/useIosScrollPasswordKeyboardIntoView';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useMyTransfers } from '../../utils/hooks/useMyTransfers';
import { useNftMe } from '../../utils/hooks/useNftMe';
import { useNftTransfersMe } from '../../utils/hooks/useNftTransfersMe';
import { useOwner } from '../../utils/hooks/useOwner';

export function ImportWalletPassword({ isPopup = false }) {
  useIosScrollPasswordKeyboardIntoView();
  const [isLoading, setIsLoading] = useState(false);
  /** Tracking user input */
  const validatePassword = (value: string) =>
    !!value.match(userConst.passwordRegex);
  const { addLocalOtkAndCache, addLocalAccount, setActiveAccount } =
    useAccountStorage();
  const importWalletForm = useAppSelector(selectImportWalletForm);
  const otk = useAppSelector(selectOtk);
  const dispatch = useAppDispatch();
  const validateConfirmPassword = (value: string) =>
    importWalletForm.password === value;
  const { mutateOwner } = useOwner();
  const { mutateMyTransfers } = useMyTransfers();
  const { mutateNftTransfersMe } = useNftTransfersMe();
  const { mutate: mutateAccountMe } = useAccountMe();
  const { mutateNftMe } = useNftMe();

  /**
   * Validates Password, creates OTK and sends on to OTK-confirmation (Create)
   * OR, for import validates password, stores OTK and send sto Success-screen
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

    if (isPasswordValid && otk && otk.identity) {
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
        dispatch(onClear());
        historyResetStackAndRedirect(urls.importWalletSuccessful);
        return;
      }

      await mutateOwner();
      await mutateMyTransfers();
      await mutateNftTransfersMe();
      await mutateAccountMe();
      await mutateNftMe();
      setIsLoading(false);
      historyResetStackAndRedirect(urls.importWalletSuccessful);
    }
  }

  const onClickCancel = () => {
    dispatch(onClear());
    historyGoBackOrReplace(urls.akashicPay);
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
