import { L2Regex, OtkType } from '@akashic/as-backend';
import type { CoinSymbol } from '@akashic/core-lib';

import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  selectActiveAccount,
  selectCacheOtk,
  selectLocalAccounts,
  setActiveAccount as setActiveAccountState,
  setCacheOtk as setCacheOtkState,
  setLocalAccounts,
} from '../../redux/slices/accountSlice';
import { getAccountUniqueId, isSameAccount } from '../account';
import { decryptLegacyCbcWithPassword } from '../aes256cbc';
import {
  decryptGcmWithPassword,
  encryptGcmWithPassword,
  GCM_PREFIX,
} from '../aes256gcm';
import { ChainAPI } from '../chain-api';
import type { FullOtk } from '../otk-generation';
import { useSecureStorage } from './useSecureStorage';

export interface LocalAccount {
  identity: string;
  publicKey?: string;
  username?: string;
  alias?: string;
  accountName?: string;
  ledgerId?: string; // aas nft ledgerId to display the image
  otkType?: OtkType;
  localStoredL1Addresses?: LocalStoredL1AddressType[];
}
export type LocalStoredL1AddressType = {
  coinSymbol: CoinSymbol;
  address: string;
};
/**
 * Storage and lookup of a users:
 * - activeAccount: session account set when user is logged in
 * - localAccounts: available accounts that user has imported
 */
export const useAccountStorage = () => {
  // Because of migrating from local storages to redux and wanting to keep the
  // data, we fetch localStorage accounts and tack them on what is stored in
  // redux, after filtering out duplicates
  // Similarly for active account
  // TODO: Delete the legacy-stuff when backwards-compatibility to local storage
  // no longer necessary
  const dispatch = useAppDispatch();
  const { getItem, setItem, removeItem } = useSecureStorage();

  const storedLocalAccounts = useAppSelector(selectLocalAccounts);

  const localAccounts = Object.values(
    [...storedLocalAccounts].reduce(
      (acc, next) => {
        next.identity && (acc[getAccountUniqueId(next)] = next);
        return acc;
      },
      {} as Record<string, LocalAccount>
    )
  );

  const cacheOtk = useAppSelector(selectCacheOtk);

  const activeAccount = useAppSelector(selectActiveAccount);

  const addPrefixToAccounts = async () => {
    if (localAccounts.some((acc) => !L2Regex.exec(acc.identity))) {
      const accountsWithPrefix = localAccounts.map((acc) => ({
        ...acc,
        identity: L2Regex.exec(acc.identity)
          ? acc.identity
          : 'AS' + acc.identity,
      }));
      dispatch(setLocalAccounts(accountsWithPrefix));
    }
  };

  const addAasToAccountByIdentity = async ({
    identity,
    otkType,
    publicKey,
    alias,
    ledgerId,
  }: {
    identity: string;
    otkType?: OtkType;
    publicKey?: string;
    alias: string;
    ledgerId: string;
  }) => {
    const updatedAccounts = localAccounts.map((localAccount) => {
      return isSameAccount(localAccount, { identity, otkType, publicKey })
        ? { ...localAccount, alias, ledgerId }
        : localAccount;
    });
    dispatch(setLocalAccounts(updatedAccounts));

    // also update the activeAccount if it is currently active
    if (
      activeAccount &&
      isSameAccount(activeAccount, { identity, otkType, publicKey })
    ) {
      dispatch(
        setActiveAccountState({
          ...activeAccount,
          alias,
          ledgerId,
        })
      );
    }
  };

  const removeAasFromAccountByIdentity = async ({
    identity,
    otkType,
    publicKey,
  }: {
    identity: string;
    publicKey?: string;
    otkType?: OtkType;
  }) => {
    const updatedAccounts = localAccounts.map((l) => {
      if (isSameAccount(l, { identity, otkType, publicKey })) {
        const { alias, ledgerId, ...rest } = l;
        return rest;
      }
      return l;
    });
    dispatch(setLocalAccounts(updatedAccounts));

    if (
      activeAccount &&
      isSameAccount(activeAccount, { identity, otkType, publicKey })
    ) {
      dispatch(
        setActiveAccountState({
          ...activeAccount,
          alias: undefined,
          ledgerId: undefined,
        })
      );
    }
  };

  const addLocalAccount = async (newAccount: LocalAccount) => {
    // Skip duplicate accounts if it already exists locally
    for (const { identity, otkType, publicKey } of localAccounts ?? []) {
      if (isSameAccount(newAccount, { identity, otkType, publicKey })) return;
    }
    dispatch(setLocalAccounts([...(localAccounts ?? []), newAccount]));
  };

  const removeLocalAccount = async (targetAccount: LocalAccount) => {
    const accountsToKeep = localAccounts.filter(
      (localAccount) => !isSameAccount(localAccount, targetAccount)
    );
    dispatch(setLocalAccounts(accountsToKeep));

    await removeLocalOtk(getAccountUniqueId(targetAccount));
  };

  const updateLocalAccount = async (
    targetAccount: LocalAccount,
    newAccount: LocalAccount
  ) => {
    // replace the targetAccount with the new account
    const newAccountList = localAccounts.map((localAccount) => {
      return isSameAccount(localAccount, targetAccount)
        ? newAccount
        : localAccount;
    });

    dispatch(setLocalAccounts(newAccountList));
  };

  const clearActiveAccount = async () => {
    dispatch(setActiveAccountState(null));
  };

  const getLocalOtk = async ({
    identity,
    otkType,
    publicKey,
    password,
  }: {
    identity: string;
    otkType?: OtkType;
    publicKey?: string;
    password: string;
  }): Promise<FullOtk | undefined> => {
    const accountId = getAccountUniqueId({ identity, otkType, publicKey });
    const encryptedOtk = await getItem(accountId);
    if (!encryptedOtk) {
      return undefined;
    }

    if (encryptedOtk.startsWith(GCM_PREFIX)) {
      return JSON.parse(
        decryptGcmWithPassword(encryptedOtk, password)
      ) as FullOtk;
    }
    // Legacy CBC path — decrypt then migrate to GCM
    const cbcDecryptedOtk = decryptLegacyCbcWithPassword(
      encryptedOtk,
      password
    );
    // Re-encrypt with GCM so this account is migrated going forward
    await setItem(accountId, encryptGcmWithPassword(cbcDecryptedOtk, password));
    return JSON.parse(cbcDecryptedOtk) as FullOtk;
  };

  const getLocalOtkAndCache = async ({
    identity,
    otkType,
    publicKey,
    password,
  }: {
    identity: string;
    otkType?: OtkType;
    publicKey?: string;
    password: string;
  }): Promise<FullOtk | undefined> => {
    const otk = await getLocalOtk({ identity, otkType, publicKey, password });

    if (otk) {
      dispatch(setCacheOtkState(otk));

      if (!!otkType && !!publicKey) {
        return otk;
      }

      // if the account is missing otkType or publicKey
      // step 1: check chain for the otkType of this otk
      const { authorities } = await ChainAPI.findIdentityStream({
        identity,
      });

      if (!authorities) {
        return otk;
      }

      const authority = authorities.find(
        (authority) => authority.public === otk?.key.pub.pkcs8pem
      );

      // step 2: if info is found, duplicate a new account using the otk & otkType
      if (!!authority) {
        const accountOtkType = authority.label ?? OtkType.PRIMARY; //its primary if chain return empty
        const migratedOtkTypeAccount = {
          identity,
          otkType: accountOtkType,
        };
        const migratedPublicKeyAccount = {
          identity,
          otkType: accountOtkType,
          publicKey: otk?.key.pub.pkcs8pem,
        };

        // add the encrypted otk to the soon migrated account
        await addLocalOtk({
          otk,
          otkType: accountOtkType,
          publicKey: otk?.key.pub.pkcs8pem,
          password,
        });
        // 1st stage migration: +otkType
        // add new account and remove old account in one single dispatch
        // !! using addLocalAccount + removeLocalAccount would NOT work
        if (!otkType) {
          await updateLocalAccount(
            { identity, otkType: undefined },
            migratedOtkTypeAccount
          );
        }
        // 2nd stage migration: +publicKey
        // user might already have an account that passed 1st stage migration
        if (!publicKey) {
          await updateLocalAccount(
            migratedOtkTypeAccount,
            migratedPublicKeyAccount
          );
        }

        setActiveAccount(migratedPublicKeyAccount);
      }
      return otk;
    } else {
      return undefined;
    }
  };

  const addLocalOtk = async ({
    otk,
    otkType,
    publicKey,
    password,
  }: {
    otk: FullOtk;
    otkType?: OtkType;
    publicKey?: string;
    password: string;
  }) => {
    await setItem(
      getAccountUniqueId({ identity: otk.identity, otkType, publicKey }),
      encryptGcmWithPassword(JSON.stringify(otk), password)
    );
  };

  const addLocalOtkAndCache = async ({
    otk,
    publicKey,
    password,
    otkType,
  }: {
    otk: FullOtk;
    password: string;
    publicKey?: string;
    otkType?: OtkType;
  }) => {
    await addLocalOtk({ otk, otkType, password, publicKey });
    dispatch(setCacheOtkState(otk));
  };

  const changeOtkPassword = async ({
    identity,
    otkType,
    publicKey,
    oldPassword,
    newPassword,
  }: {
    identity: string;
    otkType?: OtkType;
    publicKey?: string;
    oldPassword: string;
    newPassword: string;
  }) => {
    const otk = await getLocalOtk({
      identity,
      otkType,
      publicKey,
      password: oldPassword,
    });
    if (otk) {
      await addLocalOtk({ otk, otkType, publicKey, password: newPassword });
    }
  };

  const removeLocalOtk = async (accountUniqueId: string) => {
    await removeItem(accountUniqueId);

    dispatch(setCacheOtkState(null));
  };

  const localAccountsWithName: LocalAccount[] = localAccounts.map(
    (account) => ({
      ...account,
      accountName: `Account ${account.identity.slice(-8)}`,
    })
  );

  const setActiveAccount = (account: LocalAccount) => {
    dispatch(
      setActiveAccountState({
        ...account,
        accountName: `Account ${account.identity.slice(-8)}`,
      })
    );
  };

  const setCacheOtk = (otk: FullOtk | null) => {
    dispatch(setCacheOtkState(otk));
  };

  const setLocalStoredL1Addresses = ({
    identity,
    otkType,
    publicKey,
    newL1Addresses,
  }: {
    identity: string;
    publicKey?: string;
    otkType?: OtkType;
    newL1Addresses: LocalStoredL1AddressType[];
  }) => {
    if (newL1Addresses.length === 0) return;

    const updatedAccounts = localAccounts.map((l) => {
      return isSameAccount(l, { identity, otkType, publicKey })
        ? {
            ...l,
            localStoredL1Addresses: newL1Addresses,
          }
        : l;
    });

    dispatch(setLocalAccounts(updatedAccounts));

    // also update active account copy
    if (
      activeAccount &&
      isSameAccount(activeAccount, { identity, otkType, publicKey })
    ) {
      dispatch(
        setActiveAccountState({
          ...activeAccount,
          localStoredL1Addresses: newL1Addresses,
        })
      );
    }
  };

  return {
    localAccounts: localAccountsWithName,
    addLocalAccount,
    removeLocalAccount,
    addPrefixToAccounts,
    activeAccount,
    setActiveAccount,
    clearActiveAccount,
    getLocalOtkAndCache,
    addLocalOtkAndCache,
    removeLocalOtk,
    changeOtkPassword,
    getLocalOtk,
    addAasToAccountByIdentity,
    removeAasFromAccountByIdentity,
    cacheOtk,
    authenticated: !!cacheOtk,
    setCacheOtk,
    setLocalStoredL1Addresses,
  };
};
