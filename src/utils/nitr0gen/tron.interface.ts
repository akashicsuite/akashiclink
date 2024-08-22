/**
 * Tron Transaction raw data (Part of signed transaction payload)
 *
 * @interface ITronTransactionRawData
 */
export interface ITronTransactionRawData {
  contract: ITronContract[];
  ref_block_bytes: string;
  ref_block_hash: string;
  expiration: number;
  timestamp: number;
}

/**
 * A signed tron transaction
 */
export interface ITronTransaction {
  visible: boolean;
  txid: string;
  raw_data: ITronTransactionRawData;
  raw_data_hex: string;
  signature: string[];
}

/**
 * Contract part of the TronTransactionRawData
 * TODO: this is based on a few examples of TransferContract
 * so is probably incomplete
 *
 * @interface ITronContract
 */
export interface ITronContract {
  parameter: {
    value: {
      amount?: number;
      asset_name?: string;
      owner_address: string;
      to_address: string;
      data?: string;
      contract_address?: string;
    };
    type_url: string;
  };
  type: string;
}

export enum TronContractResult {
  SUCCESS = 'SUCCESS',
  REVERT = 'REVERT',
}

// Used to ignore TRC10 transactions
export const TRC10_CONTRACT_TYPE = 'TransferAssetContract';
