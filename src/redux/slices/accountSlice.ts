import { L2Regex } from '@helium-pay/backend';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { LocalAccount } from '../../utils/hooks/useLocalAccounts';
import type { FullOtk } from '../../utils/otk-generation';
import { createAppSlice } from '../app/createAppSlice';

export interface AccountState {
  localAccounts: LocalAccount[];
  activeAccount: LocalAccount | null;
  cacheOtk: FullOtk | null;
}

const initialState: AccountState = {
  localAccounts: [],
  activeAccount: null,
  cacheOtk: null,
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const accountSlice = createAppSlice({
  name: 'accountSlice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    addPrefixToAccounts: create.reducer((state) => {
      if (state.localAccounts.some((acc) => !L2Regex.exec(acc.identity))) {
        const accountsWithPrefix = state.localAccounts.map((acc) => ({
          ...acc,
          identity: L2Regex.exec(acc.identity)
            ? acc.identity
            : 'AS' + acc.identity,
        }));
        state.localAccounts = accountsWithPrefix;
      }
    }),
    addAliasToAccountByIdentity: create.reducer(
      (state, action: PayloadAction<{ alias: string; identity: string }>) => {
        const updatedAccounts = state.localAccounts.map((l) => {
          if (l.identity === action.payload.identity) {
            return { ...l, alias: action.payload.alias };
          }
          return l;
        });
        if (state.activeAccount)
          state.activeAccount = {
            ...state.activeAccount,
            alias: action.payload.alias,
          };
        state.localAccounts = updatedAccounts;
      }
    ),
    removeAliasFromAccountByIdentity: create.reducer(
      (state, action: PayloadAction<{ identity: string }>) => {
        const updatedAccounts = state.localAccounts.map((l) => {
          if (l.identity === action.payload.identity) {
            const { alias: _, ...rest } = l;
            return rest;
          }
          return l;
        });
        if (state.activeAccount) {
          state.activeAccount = { ...state.activeAccount, alias: undefined };
        }
        state.localAccounts = updatedAccounts;
      }
    ),
    addLocalAccount: create.reducer(
      (state, action: PayloadAction<{ account: LocalAccount }>) => {
        // Skip duplicate accounts
        for (const { identity } of state.localAccounts ?? [])
          if (identity === action.payload.account.identity) return;

        state.localAccounts = [
          ...(state.localAccounts ?? []),
          action.payload.account,
        ];
      }
    ),
    clearActiveAccount: create.reducer((state) => {
      state.activeAccount = null;
    }),
    setLocalAccounts: create.reducer(
      (state, action: PayloadAction<LocalAccount[]>) => {
        state.localAccounts = action.payload;
      }
    ),
    setActiveAccount: create.reducer(
      (state, action: PayloadAction<LocalAccount | null>) => {
        state.activeAccount = action.payload;
      }
    ),
    setCacheOtk: create.reducer(
      (state, action: PayloadAction<FullOtk | null>) => {
        state.cacheOtk = action.payload;
      }
    ),
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectLocalAccounts: (account) => account.localAccounts,
    selectActiveAccount: (account) => account.activeAccount,
    selectCacheOtk: (account) => account.cacheOtk,
  },
});

// Action creators are generated for each case reducer function.
export const { setLocalAccounts, setActiveAccount, setCacheOtk } =
  accountSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectLocalAccounts, selectActiveAccount, selectCacheOtk } =
  accountSlice.selectors;
