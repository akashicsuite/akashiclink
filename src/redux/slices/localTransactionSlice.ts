import type { ITransactionRecord } from '@helium-pay/backend';
import type { PayloadAction } from '@reduxjs/toolkit';

import { createAppSlice } from '../app/createAppSlice';

export interface LocalTransactionState {
  localTransactions: ITransactionRecord[];
}

const initialState: LocalTransactionState = {
  localTransactions: [],
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const localTransactionSlice = createAppSlice({
  name: 'localTransactionSlice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    addLocalTransaction: create.reducer(
      (state, action: PayloadAction<ITransactionRecord>) => {
        return {
          ...state,
          localTransactions: [...state.localTransactions, action.payload],
        };
      }
    ),
    removeLocalTransactionByL2TxnHash: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.localTransactions = state.localTransactions.filter(
          (t) => t.l2TxnHash !== action.payload
        );
      }
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectLocalTransactions: (localTransaction) =>
      localTransaction.localTransactions,
  },
});

// Action creators are generated for each case reducer function.
export const { addLocalTransaction, removeLocalTransactionByL2TxnHash } =
  localTransactionSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectLocalTransactions } = localTransactionSlice.selectors;
