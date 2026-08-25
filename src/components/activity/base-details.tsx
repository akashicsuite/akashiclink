import { TransactionStatus } from '@akashic/as-backend';
import styled from '@emotion/styled';
import { IonImg } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import type { ITransactionRecordForExtension } from '../../utils/formatTransfers';
import { useAddressBook } from '../../utils/hooks/useAddressBook';
import { AddressBookNameRow } from '../common/address-book-name-row';
import { List } from '../common/list/list';
import { ListVerticalLabelValueItem } from '../common/list/list-vertical-label-value-item';
import { ListCopyTxHashItem } from '../send/copy-tx-hash';
import { FromToAddressBlock } from '../send/from-to-address-block';

export const DetailColumn = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxHeight: '20px',
});

const StyledList = styled(List)({
  backgroundColor: 'var(--ion-background-color)',
});

export function BaseDetails({
  currentTransfer,
}: {
  currentTransfer: ITransactionRecordForExtension;
}) {
  const { t } = useTranslation();
  const storedTheme = useAppSelector(selectTheme);
  const { findContactByAddress } = useAddressBook();

  const inputAddress =
    currentTransfer.initiatedToNonL2 && currentTransfer.initiatedToNonL2 !== ''
      ? currentTransfer.initiatedToNonL2
      : currentTransfer.toAddress;
  const inputContact = inputAddress
    ? findContactByAddress(inputAddress, currentTransfer.coinSymbol)
    : undefined;
  const statusString = (status: string | undefined) => {
    switch (status) {
      case 'Any':
        return t('Any');
      case TransactionStatus.CONFIRMED:
        return t('Confirmed');
      case TransactionStatus.PENDING:
        return t('Pending');
      case TransactionStatus.FAILED:
        return t('Failed');
      case TransactionStatus.QUEUED:
        return t('Queued');
      default:
        return t('MissingTranslationError');
    }
  };

  return (
    <div
      className="transfer-detail ion-margin-top-md"
      style={{
        display: 'flex',
        gap: '8px',
        flexDirection: 'column',
      }}
    >
      <DetailColumn>
        <h4 className="ion-margin-0 ion-text-size-xs">{t('Status')}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 className="ion-no-margin ion-text-size-xs">
            {statusString(currentTransfer.status)}
          </h4>
          <IonImg
            src={`/assets/images/${currentTransfer.status}-${
              storedTheme === themeType.DARK ? 'dark' : 'white'
            }.svg`}
            style={{ width: '20px', height: '20px' }}
          />
        </div>
      </DetailColumn>
      <StyledList lines="none">
        <ListVerticalLabelValueItem
          label={t('InputAddress')}
          value={inputAddress}
          subContent={
            inputContact?.name && (
              <AddressBookNameRow name={inputContact.name} />
            )
          }
        />
        <FromToAddressBlock
          fromAddress={currentTransfer.fromAddress}
          toAddress={currentTransfer.toAddress}
          fromAddressUrl={
            currentTransfer.internalSenderUrl ??
            currentTransfer.senderAddressUrl
          }
          toAddressUrl={
            currentTransfer.internalRecipientUrl ??
            currentTransfer.recipientAddressUrl
          }
        />
        {currentTransfer.txHash && currentTransfer.txHashUrl && (
          <ListCopyTxHashItem
            txHash={currentTransfer.txHash}
            txHashUrl={currentTransfer.txHashUrl}
            suffix={currentTransfer.coinSymbol}
          />
        )}
        {currentTransfer.l2TxnHash && (
          <ListCopyTxHashItem
            txHash={currentTransfer.l2TxnHash}
            txHashUrl={currentTransfer.l2TxnHashUrl}
            suffix="AS"
            color="var(--activity-dim-text)"
          />
        )}
      </StyledList>
    </div>
  );
}
