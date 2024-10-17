import './activity.scss';

import { TransactionLayer, TransactionType } from '@helium-pay/backend';
import Big from 'big.js';
import { useTranslation } from 'react-i18next';

import { getPrecision, isGasFeeAccurate } from '../../utils/formatAmount';
import type { ITransactionRecordForExtension } from '../../utils/formatTransfers';
import { Divider } from '../common/divider';
import { List } from '../common/list/list';
import { ListLabelValueItem } from '../common/list/list-label-value-item';
import { BaseDetails } from './base-details';

export function TransactionDetails({
  currentTransfer,
}: {
  currentTransfer: ITransactionRecordForExtension;
}) {
  const { t } = useTranslation();
  return (
    <>
      <BaseDetails currentTransfer={currentTransfer} />
      <Divider style={{ width: '100%' }} className={'ion-margin-vertical'} />
      {currentTransfer.transferType === TransactionType.DEPOSIT ? (
        <DepositDetails currentTransfer={currentTransfer} />
      ) : (
        <WithdrawDetails currentTransfer={currentTransfer} />
      )}
      {
        <List lines="none">
          <Divider
            style={{ width: '100%' }}
            className={'ion-margin-vertical'}
          />
          <ListLabelValueItem
            label={t('AkashicAlias')}
            value={`${
              currentTransfer.transferType === TransactionType.WITHDRAWAL &&
              currentTransfer.receiverAlias
                ? currentTransfer.receiverAlias
                : '-'
            }`}
            valueSize={'md'}
            valueBold
          />
        </List>
      }
    </>
  );
}
const WithdrawDetails = ({
  currentTransfer,
}: {
  currentTransfer: ITransactionRecordForExtension;
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const { t } = useTranslation();
  const isL2 = currentTransfer.layer === TransactionLayer.L2;

  const gasFee = currentTransfer.feesPaid ?? currentTransfer.feesEstimate;

  const gasFeeIsEstimate =
    !currentTransfer.feesPaid && !!currentTransfer.feesEstimate;

  const precision = getPrecision(
    currentTransfer?.amount,
    gasFee ?? currentTransfer.internalFee?.withdraw ?? '0'
  );

  const gasFeeIsAccurate = isGasFeeAccurate(currentTransfer, precision);

  // Calculate total Amount
  const totalAmount = Big(currentTransfer.amount);
  const totalFee = Big(gasFee ?? '0');

  const internalFee = Big(currentTransfer.internalFee?.withdraw ?? '0');
  const totalAmountWithFee = totalAmount
    .add(internalFee)
    .add(currentTransfer.tokenSymbol ? Big(0) : totalFee);

  // If token, displayed as "USDT" for L1 and "USDT (ETH)" for L2 (since
  // deducing the chain the token belongs to is not trivial)
  const currencyDisplayName = currentTransfer?.currency?.token
    ? currentTransfer?.currency?.token +
      (isL2 ? ` (${currentTransfer.currency.chain})` : '')
    : currentTransfer?.currency?.chain;

  const feeCurrencyDisplayName =
    currentTransfer?.currency?.token && (isL2 || currentTransfer.feeIsDelegated)
      ? currentTransfer?.currency?.token +
        (isL2 ? ` (${currentTransfer.currency.chain})` : '')
      : currentTransfer?.currency?.chain;

  return (
    <List lines="none">
      <h3 className="ion-text-align-left ion-margin-0">{t('Send')}</h3>
      <ListLabelValueItem
        label={t('Amount')}
        value={`${totalAmount.toFixed(precision)} ${currencyDisplayName}`}
        valueSize={'md'}
        valueBold
      />
      <ListLabelValueItem
        label={t(
          isL2
            ? 'L2Fee'
            : currentTransfer.feeIsDelegated
            ? 'DelegatedGasFee'
            : 'GasFee'
        )}
        value={`${
          isL2 || currentTransfer.feeIsDelegated
            ? internalFee.toFixed(precision)
            : (!gasFeeIsAccurate ? '≈' : '') + totalFee.toFixed(precision)
        } ${feeCurrencyDisplayName}${gasFeeIsEstimate ? '*' : ''}`}
        valueSize={'md'}
        valueBold
      />
      <ListLabelValueItem
        label={t('Total')}
        value={`${totalAmountWithFee.toFixed(
          precision
        )} ${currencyDisplayName}`}
        remark={
          isL2 || !currentTransfer.tokenSymbol || currentTransfer.feeIsDelegated
            ? undefined
            : `+${totalFee.toFixed(precision)} ${
                currentTransfer.currency?.chain
              }${gasFeeIsEstimate ? '*' : ''}`
        }
        valueSize={'md'}
        valueBold
      />
      {gasFeeIsEstimate && (
        <ListLabelValueItem
          label={''}
          value={''}
          remark={t('EstimatedGasFeeMessage')}
        />
      )}
    </List>
  );
};
const DepositDetails = ({
  currentTransfer,
}: {
  currentTransfer: ITransactionRecordForExtension;
}) => {
  const { t } = useTranslation();
  return (
    <List lines="none">
      <h3 className="ion-text-align-left ion-margin-0">{t('Deposit')}</h3>
      <ListLabelValueItem
        label={t('Total')}
        value={`${currentTransfer.amount} ${
          currentTransfer.tokenSymbol ?? currentTransfer.coinSymbol
        }`}
        valueSize={'md'}
        valueBold
      />
    </List>
  );
};
