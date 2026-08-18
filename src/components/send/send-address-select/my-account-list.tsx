import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAccountStorage } from '../../../utils/hooks/useLocalAccounts';
import { AddressList } from './address-list';
import { MyAccountListItem } from './my-account-list-item';

interface MyAccountListProps {
  onSelectAddress: (address: string) => void;
}

export const MyAccountList: FC<MyAccountListProps> = ({ onSelectAddress }) => {
  const { t } = useTranslation();
  const { localAccounts, activeAccount } = useAccountStorage();

  // Filter out the active account to prevent self-send, then dedup by
  // identity so an L2 address held under multiple otkTypes shows only once.
  const otherAccounts = useMemo(
    () =>
      localAccounts.filter(
        (account, index, list) =>
          account.identity !== activeAccount?.identity &&
          list.findIndex((a) => a.identity === account.identity) === index
      ),
    [localAccounts, activeAccount]
  );

  return (
    <AddressList
      items={otherAccounts}
      keyExtractor={(account) => account.identity}
      onSelectItem={(account) => onSelectAddress(account.identity)}
      renderContent={(account) => (
        <MyAccountListItem
          name={account.accountName ?? account.alias ?? t('Account')}
          address={account.identity}
        />
      )}
      emptyStateMessage={t('NoOtherAccounts')}
    />
  );
};
