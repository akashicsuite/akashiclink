import './activity.scss';

import { useTranslation } from 'react-i18next';

import type { ITransactionRecordForExtension } from '../../utils/formatTransfers';
import { OneNft } from '../nft/one-nft';
import { BaseDetails } from './base-details';

export function NftDetail({
  currentTransfer,
}: {
  currentTransfer: ITransactionRecordForExtension;
}) {
  const { t } = useTranslation();

  if (!currentTransfer.nft) return null;
  return (
    <>
      <div
        style={{
          margin: '0 auto',
          width: '50%',
        }}
      >
        <OneNft
          style={{ marginTop: '0px' }}
          nft={currentTransfer.nft}
          isBig={false}
        />
      </div>
      <h2 style={{ marginTop: '24px' }}>{t('TransactionDetails')}</h2>
      <BaseDetails currentTransfer={currentTransfer} />
    </>
  );
}
