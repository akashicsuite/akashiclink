import styled from '@emotion/styled';
import { IonIcon } from '@ionic/react';
import { bookmark } from 'ionicons/icons';
import { type FC, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddressBookNew } from '../../../pages/settings/address-book/address-book-new';
import { formatDate } from '../../../utils/formatDate';
import { useAddressBook } from '../../../utils/hooks/useAddressBook';
import { useRecentAddressesSentTo } from '../../../utils/hooks/useRecentAddressesSentTo';
import { displayLongText } from '../../../utils/long-text';
import { SendFormContext } from '../send-modal-context-provider';
import { AddressList, PrimaryText, SecondaryText } from './address-list-item';

const ADDRESS_BOOK_ENABLED =
  process.env.REACT_APP_ENABLE_ADDRESS_BOOK === 'true';

const SaveButton = styled.button<{ isSaved: boolean }>(({ isSaved }) => ({
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
  cursor: isSaved ? 'default' : 'pointer',

  '&:hover': {
    background: isSaved ? 'transparent' : 'var(--ion-color-step-100)',
  },
}));

interface RecentAddressListProps {
  onSelectAddress: (address: string) => void;
}

export const RecentAddressList: FC<RecentAddressListProps> = ({
  onSelectAddress,
}) => {
  const { t } = useTranslation();
  const { currency } = useContext(SendFormContext);
  const { recentAddressesWithTimestamp, isLoading } = useRecentAddressesSentTo(
    currency.coinSymbol
  );
  const { contacts } = useAddressBook();
  const [addressToSave, setAddressToSave] = useState<string | null>(null);

  // The quick-add modal stores the address verbatim, so a direct lookup is
  // enough to tell whether a recent address is already in the Address Book.
  const isSaved = useCallback(
    (address: string) =>
      contacts.some(
        (contact) =>
          contact.address.toLowerCase() === address.toLowerCase() &&
          (contact.network === currency.coinSymbol ||
            contact.network === 'AkashicChain')
      ),
    [contacts, currency.coinSymbol]
  );

  const renderSaveButton = (item: { address: string }) => {
    const saved = isSaved(item.address);
    const label = saved ? t('SavedToAddressBook') : t('SaveToAddressBook');

    return (
      <SaveButton
        isSaved={saved}
        disabled={saved}
        aria-label={label}
        title={label}
        onClick={(event) => {
          event.stopPropagation();
          setAddressToSave(item.address);
        }}
      >
        {saved ? (
          <IonIcon icon={bookmark} style={{ fontSize: '20px' }} />
        ) : (
          <IonIcon
            src="/assets/images/bookmark_add.svg"
            style={{ fontSize: '20px' }}
          />
        )}
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
          <>
            <PrimaryText>
              {displayLongText(item.address, 30, false, true)}
            </PrimaryText>
            <SecondaryText>
              {formatDate(new Date(item.lastInteraction))}
            </SecondaryText>
          </>
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
