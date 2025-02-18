import {
  type CoinSymbol,
  type CurrencySymbol,
  type IBaseAcTransaction,
  type ITerriAcTransaction,
} from '@helium-pay/backend';

import type { ITransactionForSigning } from '../../utils/nitr0gen/nitr0gen.interface';

export type ValidatedScanAddress = {
  scanAddress: string;
  scanChain?: CoinSymbol;
  //added after user has selected currency to pay fee with
  feeChain?: CoinSymbol;
  feeToken?: CurrencySymbol;
};

export const validatedScanAddressInitialState: ValidatedScanAddress = {
  scanAddress: '',
};

export interface AddressScanConfirmationTxnsDetail {
  txn: ITransactionForSigning;
  signedTxn: IBaseAcTransaction | ITerriAcTransaction;
  validatedScanAddress: ValidatedScanAddress;
  txnFinal?: AddressScanConfirmationTxnFinal;
}

export interface AddressScanConfirmationTxnFinal {
  error?: string;
  txHash?: string;
  scanFee?: string;
}
