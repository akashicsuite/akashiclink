import { type FC, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SavedAddressItem } from '../../../pages/settings/address-book/saved-address-item';
import { useAddressBook } from '../../../utils/hooks/useAddressBook';
import { SendFormContext } from '../send-modal-context-provider';
import { AddressListContainer, EmptyState } from './address-list';

type AddressBookListProps = {
  onSelectAddress: (address: string) => void;
};

export const AddressBookList: FC<AddressBookListProps> = ({
  onSelectAddress,
}) => {
  const { t } = useTranslation();
  const { currency } = useContext(SendFormContext);
  const { contacts } = useAddressBook();

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.network === currency.coinSymbol ||
        contact.network === 'AkashicChain'
    );
  }, [contacts, currency.coinSymbol]);

  if (filteredContacts.length === 0) {
    return (
      <AddressListContainer>
        <EmptyState>{t('NoSavedAddresses')}</EmptyState>
      </AddressListContainer>
    );
  }

  return (
    <AddressListContainer>
      {filteredContacts.map((contact) => (
        <SavedAddressItem
          key={`${contact.network}-${contact.address}`}
          contact={contact}
          onClick={() => onSelectAddress(contact.address)}
        />
      ))}
    </AddressListContainer>
  );
};
