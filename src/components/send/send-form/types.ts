import type {
  FeeDelegationStrategy,
  IInternalFee,
  ITransactionBase,
} from '@akashic/as-backend';
import type {
  IBaseAcTransaction,
  ITerriAcTransaction,
  TransactionLayer,
} from '@akashic/nitr0gen';

/**
 * Describes a transaction proposal with anticipated gas fee that still needs to:
 * - Be signed
 * - Be sent to AC
 */
export interface ITransactionForSigning
  extends Omit<ITransactionBase, 'fromAddress'> {
  readonly fromAddress?: string;
  readonly internalFee?: IInternalFee;
  readonly txToSign: IBaseAcTransaction | ITerriAcTransaction;
  readonly layer: TransactionLayer;
  // Presumably mandatory if layer-1... :/
  readonly feesEstimate?: string;
  readonly fromLedgerId?: string;
}

export type ValidatedAddressPair = {
  convertedToAddress: string;
  userInputToAddress: string;
  isL2?: boolean;
  initiatedToNonL2?: string;
  alias?: string;
  userInputToAddressType?: 'l2' | 'l1' | 'alias';
  /** LedgerId of L1 wallet if that was input but result was an L2. Helps effectivize some
   * fee-proceedings for specific L2s on AC */
  initiatedToL1LedgerId?: string;
};

export const isL1AddressL2Bonded = (pair?: ValidatedAddressPair) =>
  !!pair?.isL2 && pair.userInputToAddressType === 'l1';

export const validatedAddressPairInitialState = {
  isL2: false,
  convertedToAddress: '',
  userInputToAddress: '',
};

export interface SendConfirmationTxnsDetail {
  txn: ITransactionForSigning;
  signedTxn: IBaseAcTransaction | ITerriAcTransaction;
  validatedAddressPair: ValidatedAddressPair;
  amount: string;
  delegatedFee?: string;
  feeDelegationStrategy?: FeeDelegationStrategy;
  txnFinal?: SendConfirmationTxnFinal;
}

export interface SendConfirmationTxnFinal {
  error?: string;
  isPresigned?: boolean;
  txHash?: string;
  feesEstimate?: string;
  delegatedFee?: string;
}
