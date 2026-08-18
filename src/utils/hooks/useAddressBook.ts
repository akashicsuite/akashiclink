import { getAccountUniqueId } from '../account';
import { ADDRESS_BOOK } from '../preference-keys';
import type { DepositChainOption } from './useAccountL1Address';
import { useAccountStorage } from './useLocalAccounts';
import { useLocalStorage } from './useLocalStorage';

export type AddressBookContact = {
  name: string;
  address: string;
  network: DepositChainOption;
};

type AddContactResult =
  | { success: true }
  | { success: false; error: 'name' }
  | { success: false; error: 'address'; conflictName: string };

type AddressBookStore = Record<string, AddressBookContact[]>;

export function useAddressBook() {
  const { activeAccount } = useAccountStorage();

  const accountId = activeAccount ? getAccountUniqueId(activeAccount) : null;

  const { value: store, setValue: setStore } =
    useLocalStorage<AddressBookStore>(ADDRESS_BOOK, {});

  const contacts: AddressBookContact[] =
    accountId && store ? (store[accountId] ?? []) : [];

  function setContacts(newContacts: AddressBookContact[]) {
    if (!accountId) return;
    setStore({ ...store, [accountId]: newContacts });
  }

  const findContactByAddress = (
    address: string,
    network: DepositChainOption
  ): AddressBookContact | undefined => {
    const normalized = address.trim().toLowerCase();
    return contacts.find(
      (c) =>
        c.address.toLowerCase() === normalized &&
        (c.network === network || c.network === 'AkashicChain')
    );
  };

  function addContact(contact: AddressBookContact): AddContactResult {
    if (!activeAccount) return { success: false, error: 'name' };

    const nameTaken = contacts.some(
      (c) => c.name.toLowerCase() === contact.name.trim().toLowerCase()
    );
    if (nameTaken) {
      return { success: false, error: 'name' };
    }

    const addressMatch = contacts.find(
      (c) =>
        c.address.toLowerCase() === contact.address.trim().toLowerCase() &&
        c.network === contact.network
    );
    if (addressMatch) {
      return {
        success: false,
        error: 'address',
        conflictName: addressMatch.name,
      };
    }

    setContacts([
      ...contacts,
      {
        name: contact.name.trim(),
        address: contact.address.trim(),
        network: contact.network,
      },
    ]);
    return { success: true };
  }

  function deleteContact(network: DepositChainOption, address: string) {
    if (!activeAccount) return;

    setContacts(
      contacts.filter(
        (c) =>
          !(
            c.network === network &&
            c.address.toLowerCase() === address.toLowerCase()
          )
      )
    );
  }

  function updateContact(
    originalNetwork: DepositChainOption,
    originalAddress: string,
    updated: AddressBookContact
  ): AddContactResult {
    if (!activeAccount) return { success: false, error: 'name' };

    const others = contacts.filter(
      (c) =>
        !(
          c.network === originalNetwork &&
          c.address.toLowerCase() === originalAddress.toLowerCase()
        )
    );

    const nameTaken = others.some(
      (c) => c.name.toLowerCase() === updated.name.trim().toLowerCase()
    );
    if (nameTaken) {
      return { success: false, error: 'name' };
    }

    const addressMatch = others.find(
      (c) =>
        c.address.toLowerCase() === updated.address.trim().toLowerCase() &&
        c.network === updated.network
    );
    if (addressMatch) {
      return {
        success: false,
        error: 'address',
        conflictName: addressMatch.name,
      };
    }

    setContacts([
      ...others,
      {
        name: updated.name.trim(),
        address: updated.address.trim(),
        network: updated.network,
      },
    ]);
    return { success: true };
  }

  return {
    contacts,
    addContact,
    deleteContact,
    updateContact,
    findContactByAddress,
  };
}
