import {
  NetworkDictionary,
  suffixForSolanaDevnetURL,
} from '@akashic/as-backend';
import { CoinSymbol } from '@akashic/core-lib';
import { IonItem } from '@ionic/react';
import Big from 'big.js';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { getPrecision } from '../../../utils/formatAmount';
import { useAddressBook } from '../../../utils/hooks/useAddressBook';
import { useCryptoCurrencySymbolsAndBalances } from '../../../utils/hooks/useCryptoCurrencySymbolsAndBalances';
import { AddressBookNameRow } from '../../common/address-book-name-row';
import { Divider } from '../../common/divider';
import { List } from '../../common/list/list';
import { ListLabelValueItem } from '../../common/list/list-label-value-item';
import { ListVerticalLabelValueItem } from '../../common/list/list-vertical-label-value-item';
import { NetworkDisplayRow } from '../../common/network-display-row';
import { ListCopyTxHashItem } from '../copy-tx-hash';
import { FromToAddressBlock } from '../from-to-address-block';
import { isL1AddressL2Bonded } from '../send-form/types';
import { SendFormContext } from '../send-modal-context-provider';

// eslint-disable-next-line sonarjs/cognitive-complexity
export const SendCompletedDetailList = () => {
  const { t } = useTranslation();
  const { sendConfirm, currency } = useContext(SendFormContext);
  const { isCurrencyTypeToken, currencySymbol, nativeCoinSymbol } =
    useCryptoCurrencySymbolsAndBalances(currency);
  const { findContactByAddress } = useAddressBook();
  const { coinSymbol } = currency;

  const txn = sendConfirm?.txn;
  const txnFinal = sendConfirm?.txnFinal;
  const validatedAddressPair = sendConfirm?.validatedAddressPair;
  const delegatedFee = sendConfirm?.delegatedFee;
  const txHash = txnFinal?.txHash;
  const isL2 = validatedAddressPair?.isL2;

  const inputContact = validatedAddressPair?.userInputToAddress
    ? findContactByAddress(validatedAddressPair.userInputToAddress, coinSymbol)
    : undefined;

  // Calculate total Amount
  const totalFee = txnFinal?.feesEstimate
    ? Big(txnFinal?.feesEstimate)
    : Big(txn?.feesEstimate ?? 0);
  const internalFee = Big(txn?.internalFee?.withdraw ?? 0);
  const totalAmountWithFee = Big(txn?.amount ?? '0')
    .add(internalFee)
    .add(isCurrencyTypeToken ? Big(0) : totalFee);

  const feeForPrecision = totalFee.gt(0)
    ? totalFee.toString()
    : internalFee.gt(0)
      ? internalFee.toString()
      : '0';

  const precision = getPrecision(txn?.amount ?? '0', feeForPrecision);

  const getUrl = (
    type: 'account' | 'transaction',
    isL2: boolean,
    value: string
  ) => {
    if (type === 'account') {
      if (isL2) {
        return `${process.env.REACT_APP_SCAN_BASE_URL}/accounts/${value}`;
      }
      let url = `${NetworkDictionary[coinSymbol].addressUrl}/${value}`;
      if (coinSymbol === CoinSymbol.Solana_Devnet) {
        url += suffixForSolanaDevnetURL;
      }
      return url;
    }
    // Or if transaction
    return `${process.env.REACT_APP_SCAN_BASE_URL}/transactions/${value}`;
  };

  // If token, displayed as "USDT" for L1 and "USDT (ETH)" for L2 (since
  // deducing the chain the token belongs to is not trivial)
  const currencyDisplayName = isCurrencyTypeToken
    ? currencySymbol + (isL2 ? ` (${nativeCoinSymbol})` : '')
    : nativeCoinSymbol;

  const alias = validatedAddressPair?.alias ?? '-';

  const feeCurrencyDisplayName =
    isCurrencyTypeToken && (isL2 || !!delegatedFee)
      ? currencySymbol + (isL2 ? ` (${nativeCoinSymbol})` : '')
      : nativeCoinSymbol;

  return (
    <List lines="none">
      <NetworkDisplayRow
        isL2={!!isL2}
        coinSymbol={coinSymbol}
        isL2Bonded={isL1AddressL2Bonded(validatedAddressPair)}
      />
      <ListVerticalLabelValueItem
        label={t('InputAddress')}
        value={validatedAddressPair?.userInputToAddress}
        subContent={
          inputContact?.name && <AddressBookNameRow name={inputContact.name} />
        }
      />
      <IonItem>
        <FromToAddressBlock
          fromAddress={txn?.fromAddress}
          toAddress={txn?.toAddress}
          fromAddressUrl={getUrl('account', !!isL2, txn?.fromAddress ?? '-')}
          toAddressUrl={getUrl('account', !!isL2, txn?.toAddress ?? '-')}
        />
      </IonItem>
      {txHash && (
        <IonItem>
          <ListCopyTxHashItem
            txHash={txHash}
            txHashUrl={getUrl('transaction', !!isL2, txHash)}
          />
        </IonItem>
      )}
      <IonItem>
        <Divider style={{ width: '100%' }} className={'ion-margin-vertical'} />
      </IonItem>
      <ListLabelValueItem
        label={t('Amount')}
        value={`${Big(txn?.amount ?? '0').toFixed(precision)} ${currencyDisplayName}`}
        valueSize={'md'}
        valueBold
      />
      {isL2 && (
        <ListLabelValueItem
          label={t('L2Fee')}
          value={`${internalFee.toFixed(precision)} ${feeCurrencyDisplayName}`}
          valueSize={'md'}
          valueBold
        />
      )}
      {!isL2 && (
        <ListLabelValueItem
          label={t(delegatedFee ? 'DelegatedGasFee' : 'GasFee')}
          value={`${
            delegatedFee
              ? Big(delegatedFee).toFixed(precision)
              : totalFee.toFixed(precision)
          } ${feeCurrencyDisplayName}`}
          valueSize={'md'}
          valueBold
        />
      )}
      <ListLabelValueItem
        label={t('Total')}
        value={`${totalAmountWithFee.toFixed(
          precision
        )} ${currencyDisplayName}`}
        remark={
          isL2 || !isCurrencyTypeToken || delegatedFee
            ? undefined
            : `+${totalFee.toFixed(precision)} ${nativeCoinSymbol}`
        }
        valueSize={'md'}
        valueBold
      />
      <>
        <IonItem>
          <Divider
            style={{ width: '100%' }}
            className={'ion-margin-vertical'}
          />
        </IonItem>
        <ListLabelValueItem label={t('AkashicAlias')} value={alias} labelBold />
      </>
    </List>
  );
};
