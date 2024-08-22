import { datadogRum } from '@datadog/browser-rum';
import type { PayloadAction, SerializedError } from '@reduxjs/toolkit';

import type { FullOtk } from '../../utils/otk-generation';
import { generateOTK } from '../../utils/otk-generation';
import { getRandomNumbers } from '../../utils/random-utils';
import { createAppSlice } from '../app/createAppSlice';

export interface CreateWalletForm {
  password?: string;
  confirmPassword?: string;
  confirmPassPhrase?: string[];
  checked?: boolean;
}

export interface CreateWalletState {
  maskedPassPhrase: string[];
  otk: FullOtk | null;
  error: SerializedError | null;
  createWalletForm: CreateWalletForm;
}

const initialState: CreateWalletState = {
  maskedPassPhrase: new Array(12).fill(''),
  otk: null,
  error: null,
  createWalletForm: {
    password: '',
    confirmPassword: '',
    confirmPassPhrase: new Array(12).fill(''),
    checked: false,
  },
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const createWalletSlice = createAppSlice({
  name: 'createWalletSlice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    onInputChange: create.reducer(
      (state, action: PayloadAction<CreateWalletForm>) => {
        return {
          ...state,
          createWalletForm: {
            ...state.createWalletForm,
            ...action.payload,
          },
        };
      }
    ),
    onClearOtk: create.reducer((state) => {
      return {
        ...state,
        otk: null,
      };
    }),
    onClear: create.reducer(() => {
      return initialState;
    }),
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    generateOtkAsync: create.asyncThunk(
      async () => {
        // Generate OTK
        const otk = (await generateOTK()) as FullOtk;
        if (!otk.phrase) throw new Error('No phrase!');
        const randomNumberArray = getRandomNumbers(0, 11, 4);
        const maskedPassPhrase = otk.phrase.split(' ');
        randomNumberArray.forEach((e) => {
          maskedPassPhrase[e] = '';
        });
        // The value we return becomes the `fulfilled` action payload
        return {
          otk,
          maskedPassPhrase,
        };
      },
      {
        fulfilled: (state, action) => {
          state.otk = action.payload.otk;
          state.maskedPassPhrase = action.payload.maskedPassPhrase;
          state.error = initialState.error;
        },
        rejected: (state, action) => {
          datadogRum.addError(action.error);
          state.error = action.error;
        },
      }
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectCreateWalletForm: (createWallet) => createWallet.createWalletForm,
    selectMaskedPassPhrase: (createWallet) => createWallet.maskedPassPhrase,
    selectOtk: (createWallet) => createWallet.otk,
    selectError: (createWallet) => createWallet.error,
  },
});

// Action creators are generated for each case reducer function.
export const { onInputChange, onClearOtk, onClear, generateOtkAsync } =
  createWalletSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectCreateWalletForm,
  selectMaskedPassPhrase,
  selectOtk,
  selectError,
} = createWalletSlice.selectors;
