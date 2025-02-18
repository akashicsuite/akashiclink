import { IonItem } from '@ionic/react';
import Big from 'big.js';
import { useTranslation } from 'react-i18next';

import { getPrecision } from '../../utils/formatAmount';
import { Divider } from '../common/divider';
import { List } from '../common/list/list';
import { ListLabelValueItem } from '../common/list/list-label-value-item';
import { ListVerticalLabelValueItem } from '../common/list/list-vertical-label-value-item';
import {
  type AddressScanConfirmationTxnsDetail,
  type ValidatedScanAddress,
} from './types';

export const AddressScreeningConfirmationDetailList = ({
  txnsDetail,
  validatedScanAddress,
}: {
  txnsDetail: AddressScanConfirmationTxnsDetail;
  validatedScanAddress: ValidatedScanAddress;
}) => {
  const { t } = useTranslation();

  const internalFee = Big(txnsDetail.txn.internalFee?.withdraw ?? 0);
  const totalAmountWithFee = Big(txnsDetail.txn.amount).add(internalFee);

  const precision = getPrecision(
    txnsDetail.txn.amount,
    txnsDetail.txn.internalFee?.withdraw ?? '0'
  );

  const currencyDisplayName = `${validatedScanAddress?.feeToken} (${validatedScanAddress?.feeChain})`;

  return (
    <List lines="none">
      <IonItem>
        <ListVerticalLabelValueItem
          label={t('ScanAddress')}
          value={validatedScanAddress.scanAddress}
        />
      </IonItem>
      <IonItem>
        <Divider style={{ width: '100%' }} className={'ion-margin-vertical'} />
      </IonItem>
      <ListLabelValueItem
        label={t('L2Fee')}
        value={`${internalFee.toFixed(precision)} ${currencyDisplayName}`}
        valueSize={'md'}
        valueBold
      />
      <ListLabelValueItem
        label={t('NetworkFee')}
        value={`${internalFee.toFixed(precision)} ${currencyDisplayName}`}
        valueSize={'md'}
        valueBold
      />
      <ListLabelValueItem
        label={t('Total')}
        value={`${totalAmountWithFee.toFixed(precision)} ${currencyDisplayName}`}
        valueSize={'md'}
        valueBold
      />
    </List>
  );
};
