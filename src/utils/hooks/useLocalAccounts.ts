import { L2Regex } from '@helium-pay/backend';
import crypto from 'crypto';

import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  selectActiveAccount,
  selectCacheOtk,
  selectLocalAccounts,
  setActiveAccount as setActiveAccountState,
  setCacheOtk as setCacheOtkState,
  setLocalAccounts,
} from '../../redux/slices/accountSlice';
import type { FullOtk } from '../otk-generation';
import { useSecureStorage } from './useSecureStorage';

// TODO this is vulnerable to padding oracle attacks. CBC should be replaced
//  with GCM (or similar), but we'll need to be careful about backwards
//  compatibility. https://sonarsource.atlassian.net/browse/RSPEC-5542
const algorithm = 'aes-256-cbc';
const secretIv = process.env.REACT_APP_SECRETIV ?? '6RxIESTJ1eJLpjpe';

/**
 * When logging in, a user will select a wallet `identity`
 * This is translated to a `username` that is sent with the `password`
 * to the /login endpoint
 */
export interface LocalAccount {
  identity: string;
  username?: string;
  alias?: string;
  accountName?: string;
  ledgerId?: string;
}

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
        next.identity && (acc[next.identity] = next);
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

  const addAasToAccountByIdentity = async (
    alias: string,
    identity: string,
    ledgerId: string
  ) => {
    const updatedAccounts = localAccounts.map((l) => {
      if (l.identity === identity) {
        return { ...l, alias, ledgerId };
      }
      return l;
    });
    if (activeAccount && activeAccount.identity === identity) {
      dispatch(setActiveAccountState({ ...activeAccount, alias, ledgerId }));
    }
    dispatch(setLocalAccounts(updatedAccounts));
  };

  const removeAasFromAccountByIdentity = async (identity: string) => {
    const updatedAccounts = localAccounts.map((l) => {
      if (l.identity === identity) {
        const { alias: _, ledgerId: _a, ...rest } = l;
        return rest;
      }
      return l;
    });
    if (activeAccount && activeAccount.identity === identity) {
      dispatch(
        setActiveAccountState({
          ...activeAccount,
          alias: undefined,
          ledgerId: undefined,
        })
      );
    }
    dispatch(setLocalAccounts(updatedAccounts));
  };

  const addLocalAccount = async (account: LocalAccount) => {
    // Skip duplicate accounts if it already exists locally
    for (const { identity } of localAccounts ?? []) {
      if (identity === account.identity) return;
    }

    dispatch(setLocalAccounts([...(localAccounts ?? []), account]));
  };

  const removeLocalAccount = async (account: LocalAccount) => {
    const accsToKeep = localAccounts.reduce((p, c) => {
      if (c.identity !== account.identity) {
        p.push(c);
      }
      return p;
    }, [] as LocalAccount[]);

    dispatch(setLocalAccounts(accsToKeep));
    await removeLocalOtk(account.identity);
  };

  const clearActiveAccount = async () => {
    dispatch(setActiveAccountState(null));
  };

  const getLocalOtk = async (
    identity: string,
    password: string
  ): Promise<FullOtk | undefined> => {
    const encryptedOtk = await getItem(identity);

    if (!encryptedOtk) {
      return undefined;
    }

    const encryptedOtkBuff = Buffer.from(encryptedOtk, 'base64');
    const key = genKeyFromPassword(password);
    const decipher = crypto.createDecipheriv(algorithm, key, secretIv);
    return JSON.parse(
      decipher.update(encryptedOtkBuff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    );
  };

  const getLocalOtkAndCache = async (
    identity: string,
    password: string
  ): Promise<FullOtk | undefined> => {
    const otk = await getLocalOtk(identity, password);
    if (otk) {
      dispatch(setCacheOtkState(otk));
      return otk;
    } else {
      return undefined;
    }
  };

  const addLocalOtk = async (otk: FullOtk, password: string) => {
    const key = genKeyFromPassword(password);
    // eslint-disable-next-line sonarjs/encryption-secure-mode
    const cipher = crypto.createCipheriv(algorithm, key, secretIv);
    const encryptedOtk = Buffer.from(
      cipher.update(JSON.stringify(otk), 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64');
    await setItem(otk.identity, encryptedOtk);
  };

  const addLocalOtkAndCache = async (otk: FullOtk, password: string) => {
    await addLocalOtk(otk, password);
    dispatch(setCacheOtkState(otk));
  };

  const changeOtkPassword = async (
    identity: string,
    oldPassword: string,
    newPassword: string
  ) => {
    const otk = await getLocalOtk(identity, oldPassword);
    if (otk) {
      await addLocalOtk(otk, newPassword);
    }
  };

  const removeLocalOtk = async (identity: string) => {
    await removeItem(identity);

    dispatch(setCacheOtkState(null));
  };

  // key min length is 32 byte
  const genKeyFromPassword = (password: string) => {
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')
      .substring(0, 32);
  };

  const localAccountsWithName: LocalAccount[] = localAccounts.map(
    (account) => ({
      ...account,
      accountName: `Account ${account.identity.slice(-8)}`,
    })
  );

  const setActiveAccount = (account: LocalAccount) => {
    dispatch(setActiveAccountState(account));
  };

  const setCacheOtk = (otk: FullOtk | null) => {
    dispatch(setCacheOtkState(otk));
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
  };
};
