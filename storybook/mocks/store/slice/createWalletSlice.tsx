import type {
  CreateWalletForm,
  CreateWalletState,
} from '../../../../src/redux/slices/createWalletSlice';
import { mockCacheOtk } from '../preset';

const maskedPassPhrase = [
  'throw',
  '',
  'rabbit',
  'alcohol',
  '',
  'memory',
  'resemble',
  '',
  'fancy',
  'clap',
  'witness',
  '',
];
const mockCreateWalletForm: CreateWalletForm = {
  password: '',
  confirmPassPhrase: [],
  confirmPassword: '',
  checked: false,
};

export const mockCreateWalletState: CreateWalletState = {
  maskedPassPhrase: maskedPassPhrase,
  otk: mockCacheOtk,
  error: null,
  createWalletForm: mockCreateWalletForm,
};

export type mockCreateWalletStoreParams = {
  hasPassword: boolean;
};

export const getCreateWalletSlice = ({
  hasPassword = false,
}: mockCreateWalletStoreParams) => {
  return {
    createWalletSlice: {
      ...mockCreateWalletState,
      createWalletForm: {
        ...mockCreateWalletForm,
        password: hasPassword ? 'Test1234' : '',
        confirmPassword: hasPassword ? 'Test1234' : '',
      },
    },
  };
};
