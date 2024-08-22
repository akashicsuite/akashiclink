import './activity.scss';

import type { ITransactionRecordForExtension } from '../../utils/formatTransfers';
import { NftDetail } from './nft-details';
import { TransactionDetails } from './transactions-details';

export function ActivityDetail({
  currentTransfer,
}: {
  currentTransfer: ITransactionRecordForExtension;
}) {
  return (
    <div className="transfer-detail">
      {currentTransfer.nft ? (
        <NftDetail currentTransfer={currentTransfer} />
      ) : (
        <TransactionDetails currentTransfer={currentTransfer} />
      )}
    </div>
  );
}
