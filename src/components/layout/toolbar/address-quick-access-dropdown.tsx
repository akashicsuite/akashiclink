import { IonContent, IonPopover, isPlatform } from '@ionic/react';
import { useRef, useState } from 'react';

import { useAccountL1Address } from '../../../utils/hooks/useAccountAllAddresses';
import { useAccountStorage } from '../../../utils/hooks/useLocalAccounts';
import { AccountOtkTypeTag } from '../../manage-account/account-otk-type-tag';
import { ManageAccountsModal } from '../../manage-account/manage-accounts-modal';
import { AddressQuickAccessDropdownItem } from './address-quick-access-dropdown-item';

export const AddressQuickAccessDropdown = () => {
  const { activeAccount } = useAccountStorage();
  const allAddresses = useAccountL1Address();
  const isMobile = isPlatform('ios') || isPlatform('android');

  const [showModal, setShowModal] = useState(false);
  const modal = useRef<HTMLIonModalElement>(null);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLIonPopoverElement>(null);

  if (!activeAccount) return null;

  return (
    <>
      {/* isTrigger is sort of a hotfix for now. should consider refactor AddressQuickAccessDropdownItem */}
      <AddressQuickAccessDropdownItem
        address={activeAccount?.identity ?? ''}
        chain={'AkashicChain'}
        displayName={
          activeAccount?.alias ??
          activeAccount?.accountName ??
          `Account ${activeAccount.identity.slice(-8)}`
        }
        displayNameIcon={<AccountOtkTypeTag account={activeAccount} />}
        style={{ marginLeft: -12, paddingLeft: 12 }}
        onClickIcon={() => {
          setShowModal(true);
        }}
      />
      <IonPopover
        trigger="click-trigger"
        triggerAction="click"
        reference="trigger"
        ref={popoverRef}
        isOpen={popoverOpen}
        onDidDismiss={() => {
          setPopoverOpen(false);
        }}
        style={{ '--offset-x': isMobile ? '4px' : '-48px', '--min-width': 240 }}
      >
        <IonContent style={{ backgroundColor: 'var(--ion-modal-background)' }}>
          {allAddresses.map(({ address, chain, displayName }) => (
            <AddressQuickAccessDropdownItem
              key={address}
              address={address}
              chain={chain}
              displayName={displayName}
            />
          ))}
        </IonContent>
      </IonPopover>
      <ManageAccountsModal
        modal={modal}
        isOpen={showModal}
        setIsOpen={setShowModal}
      />
    </>
  );
};
