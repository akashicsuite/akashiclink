import type {
  CryptoCurrency,
  INftTransactionRecord,
  ITransactionRecord,
  ITransactionRecordForFrontend,
  TransactionType,
} from '@akashic/as-backend';
import {
  formatNftTransactionForFrontend,
  formatTransactionForFrontend,
  TransactionStatus,
} from '@akashic/as-backend';
import { TransactionLayer } from '@akashic/nitr0gen';

const akashicScanAccountsUrl = `${process.env.REACT_APP_SCAN_BASE_URL}/accounts`;
export const akashicScanTransactionsUrl = `${process.env.REACT_APP_SCAN_BASE_URL}/transactions`;

const PENDING_OR_QUEUED_STATUSES = [
  TransactionStatus.PENDING,
  TransactionStatus.QUEUED,
];

export function isPendingOrQueued(txn: ITransactionRecordForFrontend): boolean {
  return PENDING_OR_QUEUED_STATUSES.includes(txn.status);
}

/**
 * Sorts transactions so that Queued/Pending appear first (by initiatedAt desc),
 * followed by the rest sorted by confirmedAt desc (falling back to initiatedAt).
 */
function sortTransactions(
  a: ITransactionRecordForFrontend,
  b: ITransactionRecordForFrontend
): number {
  const aIsPendingOrQueued = isPendingOrQueued(a);
  const bIsPendingOrQueued = isPendingOrQueued(b);

  if (aIsPendingOrQueued !== bIsPendingOrQueued) {
    return aIsPendingOrQueued ? -1 : 1;
  }

  if (aIsPendingOrQueued) {
    // Both pending/queued: sort by initiatedAt descending
    return b.initiatedAt.getTime() - a.initiatedAt.getTime();
  }

  // Both confirmed/failed/etc: sort by confirmedAt descending, fall back to initiatedAt
  const aTime = a.confirmedAt
    ? new Date(a.confirmedAt).getTime()
    : a.timestamp.getTime();
  const bTime = b.confirmedAt
    ? new Date(b.confirmedAt).getTime()
    : b.timestamp.getTime();
  return bTime - aTime;
}

export interface ITransactionRecordForExtension
  extends ITransactionRecordForFrontend {
  l2TxnHashUrl: string;
}

/**
 * Formats transfer records fetched from backend, separated by nft and crypto transactions
 *
 * @param transfers fetched from backend
 */
export function formatTransfers(transfers: ITransactionRecord[]) {
  const formattedTransfers = transfers.map(
    (t, id): ITransactionRecordForExtension => {
      const l2Sender =
        t?.layer === TransactionLayer.L2
          ? t.fromAddress
          : t.senderInfo?.identity;

      const l2Receiver =
        t?.layer === TransactionLayer.L2
          ? t.toAddress
          : t.receiverInfo?.identity;
      return {
        ...formatTransactionForFrontend(t, id),
        internalSenderUrl: l2Sender
          ? `${akashicScanAccountsUrl}/${l2Sender}`
          : undefined, // Keep undefined so we can default to L1 URL if there is no L2 URL
        internalRecipientUrl: l2Receiver
          ? `${akashicScanAccountsUrl}/${l2Receiver}`
          : undefined,
        l2TxnHashUrl: `${akashicScanTransactionsUrl}/${t?.l2TxnHash ?? ''}`,
      };
    }
  );

  return formattedTransfers;
}

export function formatNftTransfers(transfers: INftTransactionRecord[]) {
  return transfers.map(
    (t, id): ITransactionRecordForExtension => ({
      ...formatNftTransactionForFrontend(t, id),
      internalSenderUrl: `${akashicScanAccountsUrl}/${t.fromAddress}`,
      internalRecipientUrl: `${akashicScanAccountsUrl}/${t.toAddress}`,
    })
  );
}

export function formatMergeAndSortNftAndCryptoTransfers(
  transfers: ITransactionRecord[],
  nftTransfers: INftTransactionRecord[],
  filters?: {
    layer?: TransactionLayer;
    transferType?: TransactionType;
    txnType: ('currency' | 'nft')[];
    currency?: CryptoCurrency;
  }
) {
  const allFormattedTransfers = formatTransfers(
    !filters || filters?.txnType?.includes('currency') ? transfers : []
  ).concat(
    formatNftTransfers(
      !filters || filters?.txnType?.includes('nft') ? nftTransfers : []
    )
  );

  allFormattedTransfers.sort(sortTransactions);

  const filteredTransfers = allFormattedTransfers.filter(
    (txn) =>
      (!filters?.layer || txn.layer === filters.layer) &&
      (!filters?.transferType || txn.transferType === filters.transferType) &&
      (!filters?.currency ||
        `${txn.coinSymbol}-${txn.tokenSymbol ?? ''}` ===
          `${filters.currency?.coinSymbol}-${filters.currency?.tokenSymbol ?? ''}`)
  );

  return filteredTransfers;
}
