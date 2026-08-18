import styled from '@emotion/styled';
import { IonIcon } from '@ionic/react';
import { type FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddressBookNew } from '../../../pages/settings/address-book/address-book-new';
import { useAddressBook } from '../../../utils/hooks/useAddressBook';
import { useRecentAddressesSentTo } from '../../../utils/hooks/useRecentAddressesSentTo';
import { SendFormContext } from '../send-modal-context-provider';
import { AddressList } from './address-list';
import { RecentAddressListItem } from './recent-address-list-item';

const ADDRESS_BOOK_ENABLED =
  process.env.REACT_APP_ENABLE_ADDRESS_BOOK === 'true';

const SaveButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  padding: 0,
  border: 'none',
  borderRadius: '50%',
  background: 'transparent',
  color: 'var(--ion-color-primary)',
  cursor: 'pointer',

  '&:hover': {
    background: 'var(--ion-color-step-100)',
  },
});

const addressBookEnabled = process.env.REACT_APP_ENABLE_ADDRESS_BOOK === 'true';

export const RecentAddressList: FC<{
  onSelectAddress: (address: string) => void;
}> = ({ onSelectAddress }) => {
  const { t } = useTranslation();
  const { currency } = useContext(SendFormContext);
  const { recentAddressesWithTimestamp, isLoading } = useRecentAddressesSentTo(
    currency.coinSymbol
  );
  const { findContactByAddress } = useAddressBook();
  const [addressToSave, setAddressToSave] = useState<string | null>(null);

  // An address can't be un-saved from here, so once it is in the Address Book
  // the button has nothing left to do and is omitted entirely. The quick-add
  // modal stores the address verbatim, so a direct lookup is enough to tell.
  const renderSaveButton = (item: { address: string }) => {
    if (findContactByAddress(item.address, currency.coinSymbol)) {
      return null;
    }

    const label = t('SaveToAddressBook');

    return (
      <SaveButton
        aria-label={label}
        title={label}
        onClick={(event) => {
          event.stopPropagation();
          setAddressToSave(item.address);
        }}
      >
        <IonIcon
          src="/assets/images/bookmark_add.svg"
          style={{ fontSize: '20px' }}
        />
      </SaveButton>
    );
  };

  return (
    <>
      <AddressList
        items={recentAddressesWithTimestamp}
        keyExtractor={(item) => item.address}
        onSelectItem={(item) => onSelectAddress(item.address)}
        renderContent={(item) => (
          <RecentAddressListItem
            address={item.address}
            lastInteraction={item.lastInteraction}
            contact={
              addressBookEnabled
                ? findContactByAddress(item.address, currency.coinSymbol)
                : undefined
            }
          />
        )}
        renderTrailing={ADDRESS_BOOK_ENABLED ? renderSaveButton : undefined}
        isLoading={isLoading}
        loadingMessage={t('Loading')}
        emptyStateMessage={t('NoRecentAddresses')}
      />
      {ADDRESS_BOOK_ENABLED && (
        <AddressBookNew
          modal={{
            isOpen: addressToSave !== null,
            address: addressToSave ?? '',
            defaultNetwork: currency.coinSymbol,
            onClose: () => setAddressToSave(null),
          }}
        />
      )}
    </>
  );
};
