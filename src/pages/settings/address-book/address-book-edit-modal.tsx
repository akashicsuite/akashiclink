import styled from '@emotion/styled';
import { IonButton, IonIcon, IonModal } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  OutlineButton,
  PrimaryButton,
} from '../../../components/common/buttons';
import { StyledInput } from '../../../components/common/input/styled-input';
import type { DepositChainOption } from '../../../utils/hooks/useAccountL1Address';
import type { AddressBookContact } from '../../../utils/hooks/useAddressBook';
import { NetworkSelect } from './address-book-network-select';
import { detectNetworks } from './address-book-utils';

const PRIMARY_COLOR = '--ion-color-primary';

const ModalContent = styled.div({
  padding: '28px 24px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '100%',
  boxSizing: 'border-box',
});

const ModalHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  marginBottom: '4px',
});

const ModalBackButton = styled(IonButton)({
  position: 'absolute',
  left: 0,
  marginLeft: -8,
  width: 32,
  height: 32,
  '--padding-start': 0,
  '--padding-end': 0,
});

const ModalTitle = styled.h2({
  flex: 1,
  textAlign: 'center',
  fontSize: '1.125rem',
  fontWeight: 700,
  color: 'var(--ion-color-primary-10)',
  margin: 0,
});

const ModalFormFields = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const ErrorText = styled.span({
  fontSize: '0.75rem',
  color: 'var(--ion-color-danger)',
  paddingLeft: '16px',
});

const ModalDivider = styled.hr({
  border: 'none',
  borderTop: '1px solid var(--ion-item-alt-border-color)',
  margin: '16px 0',
});

const DeleteButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: `var(${PRIMARY_COLOR})`,
  fontSize: '1rem',
  fontWeight: 600,
  textAlign: 'center',
  padding: '4px 0',
  width: '100%',
});

const ModalButtonRow = styled.div({
  display: 'flex',
  gap: '12px',
  marginTop: 'auto',
});

export interface EditContactModalProps {
  isOpen: boolean;
  contact: AddressBookContact | null;
  onClose: () => void;
  onSave: (
    original: AddressBookContact,
    updated: { name: string; address: string; network: DepositChainOption }
  ) => { success: boolean; error?: string; conflictName?: string };
  onDelete: (network: DepositChainOption, address: string) => void;
}

export function EditContactModal({
  isOpen,
  contact,
  onClose,
  onSave,
  onDelete,
}: EditContactModalProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(contact?.name ?? '');
  const [address, setAddress] = useState(contact?.address ?? '');
  const [network, setNetwork] = useState<DepositChainOption | undefined>(
    contact?.network
  );
  const [ambiguousNetworks, setAmbiguousNetworks] = useState<
    DepositChainOption[]
  >([]);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [addressError, setAddressError] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setAddress(contact.address);
      setNetwork(contact.network);
      setAmbiguousNetworks([]);
      setNameError(undefined);
      setAddressError(undefined);
    }
  }, [contact]);

  const canSave =
    name.trim() !== '' && address.trim() !== '' && network !== undefined;

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setAddressError(undefined);

    const matches = detectNetworks(value);

    if (matches.length === 1) {
      setNetwork(matches[0]);
      setAmbiguousNetworks([]);
    } else if (matches.length > 1) {
      setNetwork(undefined);
      setAmbiguousNetworks(matches);
    } else {
      setNetwork(undefined);
      setAmbiguousNetworks([]);
    }
  };

  const handleSave = () => {
    if (!canSave || !contact) return;

    const result = onSave(contact, { name, address, network });

    if (result.success) {
      onClose();
      return;
    }

    if (result.error === 'name') {
      setNameError(t('AddressBookNameAlreadyInUse'));
    } else {
      setAddressError(
        t('AddressBookAddressAlreadySaved', { name: result.conflictName })
      );
    }
  };

  const handleDelete = () => {
    if (!contact) return;
    onDelete(contact.network, contact.address);
    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={0.95}
      breakpoints={[0, 0.95]}
      onIonModalDidDismiss={onClose}
      style={{
        '--border-radius': '24px',
        '--background': 'var(--ion-background-color)',
      }}
    >
      <div style={{ height: '95dvh', overflow: 'hidden' }}>
        {contact && (
          <ModalContent>
            <ModalHeader>
              <ModalBackButton size="small" fill="clear" onClick={onClose}>
                <IonIcon slot="icon-only" src="/assets/images/arrow-back.svg" />
              </ModalBackButton>
              <ModalTitle>{t('EditContact')}</ModalTitle>
            </ModalHeader>
            <ModalFormFields>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <StyledInput
                  label={t('Name')}
                  placeholder={t('EnterAName')}
                  value={name}
                  isValid={nameError === undefined}
                  onIonInput={({ detail: { value } }) => {
                    setName(value as string);
                    setNameError(undefined);
                  }}
                />
                {nameError && <ErrorText>{nameError}</ErrorText>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <StyledInput
                  label={t('Address')}
                  placeholder={t('EnterAnAddress')}
                  value={address}
                  isValid={addressError === undefined}
                  onIonInput={({ detail: { value } }) =>
                    handleAddressChange(value as string)
                  }
                />
                {addressError && <ErrorText>{addressError}</ErrorText>}
              </div>
              {ambiguousNetworks.length > 1 && (
                <NetworkSelect
                  options={ambiguousNetworks}
                  value={network}
                  onChange={setNetwork}
                />
              )}
            </ModalFormFields>
            <ModalDivider />
            <DeleteButton onClick={handleDelete}>
              {t('DeleteFromAddressBook')}
            </DeleteButton>
            <ModalButtonRow>
              <PrimaryButton
                expand="block"
                onClick={handleSave}
                disabled={!canSave}
                style={{ flex: 1 }}
              >
                {t('Save')}
              </PrimaryButton>
              <OutlineButton
                expand="block"
                onClick={onClose}
                style={{ flex: 1 }}
              >
                {t('Cancel')}
              </OutlineButton>
            </ModalButtonRow>
          </ModalContent>
        )}
      </div>
    </IonModal>
  );
}
