import {
  IonButton,
  IonButtons,
  IonIcon,
  IonModal,
  IonText,
  IonToolbar,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { LocalAccount } from '../../utils/hooks/useLocalAccounts';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useLogout } from '../../utils/hooks/useLogout';
import { OutlineButton, PrimaryButton } from '../common/buttons';
import { AccountListItem } from './account-list-item';

export const DeleteAccountModal = ({
  isOpen,
  onCancel,
  account,
}: {
  isOpen: boolean;
  onCancel: () => void;
  account: LocalAccount;
}) => {
  const { t } = useTranslation();
  const {
    localAccounts,
    removeLocalAccount,
    activeAccount,
    clearActiveAccount,
  } = useAccountStorage();
  const logout = useLogout();

  const onConfirm = async () => {
    await removeLocalAccount(account);

    // if removing the last accounts save or removing the current account, logs out user
    if (
      localAccounts.length === 1 ||
      activeAccount?.identity === account.identity
    ) {
      await clearActiveAccount();
      await logout();
    }

    onCancel();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onCancel}
      className="custom-alert delete-modal"
    >
      <IonToolbar>
        <IonButtons slot="end">
          <IonButton onClick={onCancel}>
            <IonIcon
              className="icon-button-icon"
              slot="icon-only"
              icon={closeOutline}
            />
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <div
        className={
          'warning ion-display-flex ion-flex-direction-column ion-gap-lg'
        }
      >
        <IonIcon
          src={'/shared-assets/images/error-outline.svg'}
          style={{ width: '48px', height: '48px' }}
        />
        <div
          className={'ion-gap-md ion-display-flex ion-flex-direction-column'}
        >
          <h3 className={'ion-text-align-center ion-margin-0'}>
            {t('RemoveTheAccount')}
          </h3>
          <div>
            <AccountListItem lines={'none'} account={account} isShortAddress />
          </div>
          <IonText
            className={'ion-text-align-center ion-text-size-xs'}
            color={'dark'}
          >
            <p className={'ion-text-align-center'}>
              {t('UnsavedDataWillBeRemoved')}
            </p>
          </IonText>
        </div>
        <div
          className={
            'w-100 ion-display-flex ion-flex-direction-column ion-gap-sm'
          }
        >
          <PrimaryButton className={'w-100'} onClick={onConfirm} expand="block">
            {t('RemoveAccount')}
          </PrimaryButton>
          <OutlineButton className={'w-100'} expand="block" onClick={onCancel}>
            {t('Cancel')}
          </OutlineButton>
        </div>
      </div>
    </IonModal>
  );
};
