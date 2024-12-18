import styled from '@emotion/styled';
import { IonIcon } from '@ionic/react';
import { caretDownOutline } from 'ionicons/icons';
import { useRef, useState } from 'react';

import { ManageAccountsModal } from '../../../pages/manage-accounts/manage-accounts-modal';
import { useAccountStorage } from '../../../utils/hooks/useLocalAccounts';

export const ChainDiv = styled.div({
  width: '100%',
  height: '40px',
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 700,
  color: 'var(--ion-color-primary-10)',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderBottom: '2px solid var(--ion-color-primary-70)',
  cursor: 'pointer',
});

export const AccountNameBar = () => {
  const { localAccounts, activeAccount } = useAccountStorage();
  const [showModal, setShowModal] = useState(false);
  const modal = useRef<HTMLIonModalElement>(null);

  const handleOnClick = () => {
    setShowModal(true);
  };

  const displayName =
    activeAccount?.alias ??
    activeAccount?.accountName ??
    localAccounts.find((acc) => acc.identity === activeAccount?.identity)
      ?.accountName ??
    'Account';

  return (
    <>
      <ChainDiv onClick={handleOnClick}>
        <span className={'ion-margin-right-xxs ion-text-size-xs'}>
          {displayName}
        </span>
        <IonIcon icon={caretDownOutline}></IonIcon>
      </ChainDiv>
      <ManageAccountsModal
        modal={modal}
        isOpen={showModal}
        setIsOpen={setShowModal}
      />
    </>
  );
};
