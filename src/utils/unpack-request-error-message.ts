import {
  authError,
  keyError,
  otherError,
  userError,
} from '@helium-pay/backend';
import type { SerializedError } from '@reduxjs/toolkit';
import axios from 'axios';

function isSerializedError(object: unknown): object is SerializedError {
  return (
    !!(<SerializedError>object)?.message && !!(<SerializedError>object)?.stack
  );
}

/**
 * find the correct error message string from i18n folder, if not, return t(`GenericFailureMsg`)
 *
 *
 * @returns string for error message
 * @param error error from try catch
 */
export const unpackRequestErrorMessage = (error: unknown) => {
  const errorMsg = axios.isAxiosError(error)
    ? error?.response?.data?.message
    : error instanceof Error || isSerializedError(error)
      ? error.message
      : '';

  switch (true) {
    // TODO: the 3 errors below are most likely handled server-side - check and remove
    case errorMsg.includes('Stream(s) not found'):
      return keyError.invalidL2Address;
    case errorMsg.includes('Part-Balance to low'):
      return keyError.savingsExceeded;
    case errorMsg.includes('Input Stream'):
      return otherError.providerError;
    case errorMsg.includes('unable to decrypt data'):
      return 'InvalidPassword';
    case errorMsg === userError.userNotFoundError:
      return 'UserDoesNotExist';
    case errorMsg === userError.activationCodeInvalid:
      return 'ActivationCodeInvalid';
    case errorMsg === authError.otkNotFoundError:
      return 'OTKNotFound';
    case errorMsg === keyError.unownedKey:
      return 'UnownedKey';
    case errorMsg === otherError.providerError:
      return 'ProviderError';
    case errorMsg === keyError.noTransaction:
      return 'NoTransaction';
    case errorMsg === otherError.unsupportedCoinError:
      return 'UnsupportedCoinError';
    case errorMsg === otherError.transactionTooSmallError:
      return 'TransactionTooSmall';
    case errorMsg === otherError.validationError:
      return 'ValidationError';
    case errorMsg === userError.invalidApiPassOrPassword:
      return 'InvalidApiPassOrPassword';
    case errorMsg === userError.invalidUserErrorMsg:
      return 'InvalidUserOrPass';
    case errorMsg === userError.invalidPassErrorMsg:
      return 'InvalidPassword';
    case errorMsg === authError.newPassIsSameAsOldError:
      return 'NewPassSameAsOld';
    case errorMsg === keyError.savingsExceeded:
      return 'SavingsExceeded';
    case errorMsg === keyError.nativeExceeded:
      return 'showNativeCoinNeededMsg';
    case errorMsg === keyError.tokenNotFound:
      return 'TokenNotFound';
    case errorMsg === keyError.walletIsBusy:
      return 'WalletIsBusy';
    case errorMsg === keyError.transactionTimedOut:
      return 'TransactionTimeOut';
    case errorMsg === otherError.signingError:
      return 'ProviderError';
    case errorMsg === otherError.otkSwapAlreadyDone:
      return 'AlreadyMigratedPleaseReImport';
    case errorMsg === keyError.invalidPrivateKey:
      return 'InvalidKeyPair';
    default:
      return 'GenericFailureMsg';
  }
};
