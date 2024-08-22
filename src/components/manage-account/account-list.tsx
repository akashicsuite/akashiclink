import styled from '@emotion/styled';
import { IonList, isPlatform } from '@ionic/react';
import React, { useState } from 'react';

import type { LocalAccount } from '../../utils/hooks/useLocalAccounts';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useLogout } from '../../utils/hooks/useLogout';
import { AccountListItem } from './account-list-item';
import { AccountManagementList } from './account-management-list';
import { DeleteAccountModal } from './delete-account-modal';

const StyledList = styled(IonList)({
  backgroundColor: 'var(--ion-background)',
  marginBottom: 16,
  overflow: 'scroll',
  ['ion-item::part(native)']: {
    '--padding-start': 0,
    '--inner-padding-end': 0,
  },
});
export const AccountList = () => {
  const { localAccounts, activeAccount, setActiveAccount } =
    useAccountStorage();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<LocalAccount | null>(
    null
  );
  const isMobile = isPlatform('ios') || isPlatform('android');
  const logout = useLogout();

  const onDeleteAccountClick = (account: LocalAccount) => () => {
    setAccountToDelete(account);
    setIsAlertOpen(true);
  };

  const onCancelModal = () => {
    setIsAlertOpen(false);
  };

  const onSelectAccountClick = (account: LocalAccount) => async () => {
    await logout();
    setActiveAccount(account);
  };

  return (
    <>
      <StyledList
        style={{
          height: `calc(100vh - ${
            isMobile ? '368px - var(--ion-safe-area-bottom)' : '320px'
          })`,
        }}
        lines={'full'}
      >
        {localAccounts.map((account, i) => (
          <AccountListItem
            lines={i === localAccounts.length - 1 ? 'none' : 'full'}
            isActive={account.identity === activeAccount?.identity}
            button
            key={account.identity}
            onClick={
              isDeleting
                ? onDeleteAccountClick(account)
                : account.identity !== activeAccount?.identity
                ? onSelectAccountClick(account)
                : undefined
            }
            showDeleteIcon={isDeleting}
            account={account}
          />
        ))}
      </StyledList>
      <AccountManagementList
        isDeleting={isDeleting}
        onClickRemove={() => setIsDeleting(!isDeleting)}
      />
      {accountToDelete && (
        <DeleteAccountModal
          isOpen={isAlertOpen}
          account={accountToDelete}
          onCancel={onCancelModal}
        />
      )}
    </>
  );
};
