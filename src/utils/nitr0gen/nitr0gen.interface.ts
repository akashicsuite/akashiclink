/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CoinSymbol,
  CurrencySymbol,
  IBaseAcTransaction,
  IInternalFee,
  ITerriAcTransaction,
  ITransactionBase,
  TransactionLayer,
} from '@helium-pay/backend';

/** ********* Internal Arguments/Responses ********* **/

export interface L2TxDetail {
  toAddress: string;
  coinSymbol: CoinSymbol;
  tokenSymbol?: CurrencySymbol;
  amount: string;
  initiatedToNonL2?: string;
  /** LedgerId of L1 wallet if that was input but result was an L2. Helps effectivize some
   * fee-proceedings for specific L2s on AC */
  initiatedToL1LedgerId?: string;
}

export interface L1TxDetail {
  amount: string;
  nonce?: number;
}

export interface IOnboardedIdentity {
  ledgerId: string;
}

/** ********* AC Responses ********* **/

/**
 * Generic ActiveLedger Response
 */
export interface ActiveLedgerResponse<T = any> {
  $umid: string;
  $summary: {
    total: number;
    vote: number;
    commit: number;
    // Sometimes omitted if there are no errors
    errors?: string[];
  };
  $streams: {
    new: any[];
    updated: any[];
  };
  $responses?: T[];
  $debug?: any;
}

export interface IKeyCreationResponse {
  id: string;
  address: string;
  hashes: string[];
}

/** ********* L1 Stuff ********* **/

export interface ITransactionSuccessResponse {
  isSuccess: true;
  txHash: string;
  // Should probably not be optional. But fuck me this code is a mess.
  feesEstimate?: string;
}
export interface ITransactionFailureResponse {
  isSuccess: false;
  reason: string;
}
/**
 * Describes response object returned by the backend when a transaction is sent
 * to the blockchain and the transaction's promise is resolved/rejected
 */
export type ITransactionSettledResponse =
  | ITransactionSuccessResponse
  | ITransactionFailureResponse;

/**
 * Describes a transaction proposal with anticipated gas fee that still needs to:
 * - Be signed
 * - Be sent to AC
 */
export interface ITransactionForSigning extends ITransactionBase {
  readonly internalFee?: IInternalFee;
  readonly txToSign: IBaseAcTransaction | ITerriAcTransaction;
  readonly layer: TransactionLayer;
  // Presumably mandatory if layer-1... :/
  readonly feesEstimate?: string;
  readonly fromLedgerId?: string;
}
