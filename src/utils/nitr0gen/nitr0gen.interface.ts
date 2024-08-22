/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CoinSymbol, CurrencySymbol } from '@helium-pay/backend';

import type { ITronTransaction } from './tron.interface';

/** ********* Internal Arguments/Responses ********* **/

export interface L2TxDetail {
  toAddress: string;
  coinSymbol: CoinSymbol;
  tokenSymbol?: CurrencySymbol;
  amount: string;
  initiatedToNonL2?: string;
}

export interface L1TxDetail {
  amount: string;
  hex?: ITronTransaction;
  nonce?: number;
}

export interface IOnboardedIdentity {
  ledgerId: string;
}

export interface ICreatedKey {
  ledgerId: string;
  address: string;
  hashes: string[];
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

/**
 * Nitr0gen Contract for signing ethereum coin and token transfers
 */
export interface Nitr0EthereumTrxSignature {
  to: string;
  from: string;
  amount: string;
  nonce: number;
  chainId: number;
  gas: string;
  contractAddress?: string;
}

/**
 * Nitr0gen contract for signing tron coin and token transfers
 */
export interface Nitr0TronTrxSignature {
  to: string;
  amount: unknown;
  hex: ITronTransaction;
}

/**
 * Nitr0gen contract for signing btc transfers
 */
export interface Nitr0BtcSignature {
  inputs: {
    address: string;
    txid: string;
    outputIndex: number;
    satoshis: number;
    script: null;
    scriptPubKey: null;
  }[];
  outputs: {
    address: string;
    satoshis: number;
  }[];
  fees: number;
  to: string;
  amount: string;
}

export type TransactionSignature =
  | Nitr0EthereumTrxSignature
  | Nitr0TronTrxSignature
  | Nitr0BtcSignature;

export interface INewNitr0genKey {
  ledgerId: string;
  address: string;
  hashes: string[];
}
