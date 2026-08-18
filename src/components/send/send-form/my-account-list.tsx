import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAccountStorage } from '../../../utils/hooks/useLocalAccounts';
import { displayLongText } from '../../../utils/long-text';
import { AddressList, PrimaryText, SecondaryText } from './address-list-item';

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
        <>
          <PrimaryText>
            {account.accountName ?? account.alias ?? t('Account')}
          </PrimaryText>
          <SecondaryText>
            {displayLongText(account.identity, 30, false, true)}
          </SecondaryText>
        </>
      )}
      emptyStateMessage={t('NoOtherAccounts')}
    />
  );
};
