import '../../../components/common/input/styled-input.scss';

import { type ILookForL2Address } from '@akashic/as-backend';
import styled from '@emotion/styled';
import { IonButton, IonIcon, IonModal } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AlertBox } from '../../../components/common/alert/alert';
import {
  OutlineButton,
  PrimaryButton,
} from '../../../components/common/buttons';
import { StyledInput } from '../../../components/common/input/styled-input';
import { DashboardLayout } from '../../../components/page-layout/dashboard-layout';
import {
  PageHeader,
  SettingsWrapper,
} from '../../../components/settings/base-components';
import { historyGoBackOrReplace } from '../../../routing/history';
import { OwnersAPI } from '../../../utils/api';
import type { DepositChainOption } from '../../../utils/hooks/useAccountL1Address';
import { useAddressBook } from '../../../utils/hooks/useAddressBook';
import { NetworkSelect } from './address-book-network-select';
import { detectNetworks } from './address-book-utils';

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

const ModalButtonRow = styled.div({
  display: 'flex',
  gap: '12px',
  marginTop: 'auto',
});

const alertBoxStyle = {
  container: {
    borderLeft: '8px solid var(--ion-color-primary)',
    borderTop: '1px solid var(--ion-color-primary)',
    borderRight: '1px solid var(--ion-color-primary)',
    borderBottom: '1px solid var(--ion-color-primary)',
    padding: '8px',
    justifyContent: 'flex-start' as const,
    gap: '2px',
  },
  text: {
    color: 'var(--ion-color-inverse-surface)',
    textAlign: 'left' as const,
    margin: 0,
  },
  icon: {
    color: 'var(--ion-color-primary)',
  },
};

export interface AddressBookNewProps {
  /**
   * When provided, renders as a quick-add modal for saving an address the
   * user already has at hand (e.g. one they recently sent to) instead of the
   * full Address Book "new contact" page.
   *
   * Unlike the full form, the quick-add modal stores the address exactly as
   * it was given, without resolving L1 addresses to their AkashicChain
   * equivalent. That keeps the stored contact identical to the address the
   * user acted on, so callers can tell whether an address is already saved
   * by looking it up directly.
   */
  modal?: {
    isOpen: boolean;
    /** Address to save — prefilled and not editable, so only a name is needed. */
    address: string;
    /** Preferred network, used when the address is consistent with it. */
    defaultNetwork?: DepositChainOption;
    onClose: () => void;
  };
}

export function AddressBookNew({ modal }: AddressBookNewProps = {}) {
  const { t } = useTranslation();
  const { addContact } = useAddressBook();

  const [name, setName] = useState('');
  const [address, setAddress] = useState(modal?.address ?? '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [addressError, setAddressError] = useState<string | undefined>();
  const [duplicateError, setDuplicateError] = useState(false);
  const [network, setNetwork] = useState<DepositChainOption | undefined>();
  const [ambiguousNetworks, setAmbiguousNetworks] = useState<
    DepositChainOption[]
  >([]);
  const [resolvedL2Address, setResolvedL2Address] = useState<string>();
  const l2LookupTimer = useRef<ReturnType<typeof setTimeout>>();

  // Reset the form each time the quick-add modal opens for a (possibly new)
  // address, since the caller may reuse the same mounted component instance.
  useEffect(() => {
    if (!modal?.isOpen) return;

    setAddress(modal.address);
    setName('');
    setNameError(undefined);
    setAddressError(undefined);

    const matches = detectNetworks(modal.address);

    // The caller's list is already scoped to one coin, so prefer that network
    // whenever the address is consistent with it — it settles look-alike
    // chains (e.g. a testnet and its mainnet) without asking the user.
    let detected: DepositChainOption | undefined;
    if (modal.defaultNetwork && matches.includes(modal.defaultNetwork)) {
      detected = modal.defaultNetwork;
    } else if (matches.length === 1) {
      detected = matches[0];
    } else if (matches.length === 0) {
      detected = modal.defaultNetwork;
    }

    setNetwork(detected);
    // Left undefined only when the address matches several chains, in which
    // case the user has to pick one.
    setAmbiguousNetworks(detected === undefined ? matches : []);
  }, [modal?.isOpen, modal?.address, modal?.defaultNetwork]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setDuplicateError(false);
    setResolvedL2Address(undefined);

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

    // Check if the L1 address belongs to an AC user (debounced)
    clearTimeout(l2LookupTimer.current);
    const isL1 = matches.length >= 1 && !matches.includes('AkashicChain');
    if (isL1 && value.trim()) {
      l2LookupTimer.current = setTimeout(async () => {
        try {
          const results = await Promise.all(
            matches.map((chain) =>
              OwnersAPI.lookForL2Address({
                to: value.trim(),
                coinSymbol: chain as ILookForL2Address['coinSymbol'],
              })
            )
          );
          const match = results.find((r) => !!r.l2Address);
          setResolvedL2Address(match?.l2Address);
        } catch {
          setResolvedL2Address(undefined);
        }
      }, 500);
    }
  };

  useEffect(() => () => clearTimeout(l2LookupTimer.current), []);

  const canSave = modal
    ? name.trim() !== '' && network !== undefined
    : name.trim() !== '' &&
      address.trim() !== '' &&
      (network !== undefined || !!resolvedL2Address);

  const handleSave = () => {
    if (!canSave) return;

    if (modal) {
      const result = addContact({
        name: name.trim(),
        address: address.trim(),
        network: network!,
      });

      if (result.success) {
        modal.onClose();
        return;
      }

      if (result.error === 'name') {
        setNameError(t('AddressBookNameAlreadyInUse'));
      } else {
        setAddressError(
          t('AddressBookAddressAlreadySaved', { name: result.conflictName })
        );
      }
      return;
    }

    const savedNetwork: DepositChainOption = resolvedL2Address
      ? 'AkashicChain'
      : network!;
    const savedAddress = resolvedL2Address ?? address;

    const result = addContact({
      name,
      address: savedAddress,
      network: savedNetwork,
    });

    if (result.success) {
      historyGoBackOrReplace();
      return;
    }

    setDuplicateError(true);
  };

  if (modal) {
    return (
      <IonModal
        isOpen={modal.isOpen}
        onIonModalDidDismiss={modal.onClose}
        style={{
          '--border-radius': '24px',
          '--background': 'var(--ion-background-color)',
        }}
      >
        <ModalContent>
          <ModalHeader>
            <ModalBackButton size="small" fill="clear" onClick={modal.onClose}>
              <IonIcon slot="icon-only" src="/assets/images/arrow-back.svg" />
            </ModalBackButton>
            <ModalTitle>{t('AddNewContact')}</ModalTitle>
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
                readonly
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
              onClick={modal.onClose}
              style={{ flex: 1 }}
            >
              {t('Cancel')}
            </OutlineButton>
          </ModalButtonRow>
        </ModalContent>
      </IonModal>
    );
  }

  return (
    <DashboardLayout>
      <SettingsWrapper>
        <PageHeader>{t('AddNewContact')}</PageHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <StyledInput
            label={t('Name')}
            placeholder={t('EnterAName')}
            value={name}
            onIonInput={({ detail: { value } }) => {
              setName(value as string);
              setDuplicateError(false);
            }}
          />
          <StyledInput
            label={t('Address')}
            placeholder={t('EnterAnAddress')}
            value={address}
            onIonInput={({ detail: { value } }) =>
              handleAddressChange(value as string)
            }
          />
          {resolvedL2Address && (
            <AlertBox
              state={{
                success: true,
                visible: true,
                message: 'AddressBookBelongsToL2Warning',
              }}
              customStyle={alertBoxStyle}
              icon={warningOutline}
            />
          )}
          {ambiguousNetworks.length > 1 && !resolvedL2Address && (
            <NetworkSelect
              options={ambiguousNetworks}
              value={network}
              onChange={setNetwork}
            />
          )}
        </div>
        <PrimaryButton expand="block" onClick={handleSave} disabled={!canSave}>
          {t('Save')}
        </PrimaryButton>
        {duplicateError && (
          <AlertBox
            state={{
              success: false,
              visible: true,
              message: 'AddressBookDuplicateWarningTitle',
              subtitle: 'AddressBookDuplicateWarningSubtitle',
            }}
            customStyle={alertBoxStyle}
            icon={warningOutline}
          />
        )}
      </SettingsWrapper>
    </DashboardLayout>
  );
}
