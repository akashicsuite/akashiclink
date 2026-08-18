import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../redux/app/hooks';
import { selectTheme } from '../../../redux/slices/preferenceSlice';
import { themeType } from '../../../theme/const';
import type { DepositChainOption } from '../../../utils/hooks/useAccountL1Address';
import type { AddressBookContact } from '../../../utils/hooks/useAddressBook';
import { displayLongText } from '../../../utils/long-text';
import { getNetworkColor } from './address-book-utils';

const ContactItem = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 0',
  borderBottom: '1px solid var(--ion-color-step-150)',
  cursor: 'pointer',
  '&:last-of-type': {
    borderBottom: 'none',
  },
});

const ContactInfo = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  whiteSpace: 'nowrap',
});

const ContactNameRow = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const NetworkLabel = styled.span<{ color: string }>(({ color }) => ({
  fontSize: '0.875rem',
  fontWeight: 700,
  color,
}));

const Dot = styled.span({
  fontSize: '0.875rem',
  color: 'var(--ion-color-on-surface-light)',
});

const ContactName = styled.span({
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'var(--ion-text-color-alt)',
});

const ContactAddress = styled.span({
  fontSize: '0.75rem',
  color: 'var(--ion-color-on-surface-light)',
  marginTop: '2px',
});

function getNetworkLabel(
  network: DepositChainOption,
  t: (key: string) => string
): string {
  return network === 'AkashicChain'
    ? t('Chain.AkashicChain')
    : t(`Chain.${network.toUpperCase()}`);
}

export const SavedAddressContact = ({
  contact,
}: {
  contact: AddressBookContact;
}) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(selectTheme) === themeType.DARK;

  return (
    <ContactInfo>
      <ContactNameRow>
        <NetworkLabel color={getNetworkColor(contact.network, isDarkMode)}>
          {getNetworkLabel(contact.network, t)}
        </NetworkLabel>
        <Dot>&middot;</Dot>
        <ContactName>{contact.name}</ContactName>
      </ContactNameRow>
      <ContactAddress>
        {displayLongText(contact.address, 40, false, true)}
      </ContactAddress>
    </ContactInfo>
  );
};

export function SavedAddressItem({
  contact,
  onClick,
}: {
  contact: AddressBookContact;
  onClick: () => void;
}) {
  return (
    <ContactItem onClick={onClick}>
      <SavedAddressContact contact={contact} />
    </ContactItem>
  );
}
