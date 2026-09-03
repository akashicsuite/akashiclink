import { OtkType } from '@akashic/as-backend';

import { type LocalAccount, useAccountStorage } from './hooks/useLocalAccounts';

export const getAccountUniqueId = (account: LocalAccount) => {
  return `${account.identity}${account.otkType ? `-${account.otkType}` : ''}${account.publicKey ? `-${account.publicKey}` : ''}`;
};

export const isSameAccount = (
  accountA: LocalAccount,
  accountB: LocalAccount
) => {
  return getAccountUniqueId(accountA) === getAccountUniqueId(accountB);
};

export type ACCESS_SCOPE = {
  send: boolean;
  deposit: boolean;
  nftTransfer: boolean;
  allTransactionsHistory: boolean;
  individualAssetQuickAccess: boolean;
  accountManagement: boolean;
  addressScanning: boolean;
};

export const ACCOUNT_OTK_TYPE_ALLOWED_ACCESS: Record<OtkType, ACCESS_SCOPE> = {
  [OtkType.PRIMARY]: {
    send: true,
    deposit: false,
    nftTransfer: true,
    allTransactionsHistory: true,
    individualAssetQuickAccess: true,
    accountManagement: true,
    addressScanning: true,
  },
  [OtkType.SECONDARY]: {
    send: true,
    deposit: false,
    nftTransfer: true,
    allTransactionsHistory: true,
    individualAssetQuickAccess: true,
    accountManagement: true,
    addressScanning: true,
  },
  [OtkType.TREASURY]: {
    send: false,
    deposit: false,
    nftTransfer: false,
    allTransactionsHistory: true,
    individualAssetQuickAccess: false,
    accountManagement: false,
    addressScanning: false,
  },
  [OtkType.CUSTOMER_SERVICE]: {
    send: false,
    deposit: false,
    nftTransfer: false,
    allTransactionsHistory: false,
    individualAssetQuickAccess: false,
    accountManagement: false,
    addressScanning: false,
  },
  [OtkType.CUSTOMER_SERVICE_MANAGER]: {
    send: false,
    deposit: false,
    nftTransfer: false,
    allTransactionsHistory: false,
    individualAssetQuickAccess: false,
    accountManagement: false,
    addressScanning: false,
  },
};

export const isScopeAccessAllowed = (
  otkType: OtkType | undefined,
  scope: keyof ACCESS_SCOPE
) => {
  return otkType ? ACCOUNT_OTK_TYPE_ALLOWED_ACCESS[otkType]?.[scope] : false;
};

export const useIsScopeAccessAllowed = (scope: keyof ACCESS_SCOPE) => {
  const { activeAccount } = useAccountStorage();

  return isScopeAccessAllowed(activeAccount?.otkType, scope);
};
