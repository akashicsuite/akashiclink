import { SavedAddressContact } from '../../../pages/settings/address-book/saved-address-item';
import { formatDate } from '../../../utils/formatDate';
import type { AddressBookContact } from '../../../utils/hooks/useAddressBook';
import { displayLongText } from '../../../utils/long-text';
import { PrimaryText, SecondaryText } from './address-list-item';

export const RecentAddressListItem = ({
  address,
  lastInteraction,
  contact,
}: {
  address: string;
  lastInteraction: Date;
  contact?: AddressBookContact;
}) => (
  <>
    {contact ? (
      <SavedAddressContact contact={contact} />
    ) : (
      <PrimaryText>{displayLongText(address, 30, false, true)}</PrimaryText>
    )}
    <SecondaryText>{formatDate(new Date(lastInteraction))}</SecondaryText>
  </>
);
