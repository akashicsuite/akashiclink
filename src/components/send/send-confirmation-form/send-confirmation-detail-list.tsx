import { NetworkDictionary } from '@akashic/as-backend';
import { IonItem, IonText } from '@ionic/react';
import Big from 'big.js';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { getPrecision } from '../../../utils/formatAmount';
import { useAddressBook } from '../../../utils/hooks/useAddressBook';
import { useCryptoCurrencySymbolsAndBalances } from '../../../utils/hooks/useCryptoCurrencySymbolsAndBalances';
import { AddressBookNameRow } from '../../common/address-book-name-row';
import { L2Icon } from '../../common/chain-icon/l2-icon';
import { NetworkIcon } from '../../common/chain-icon/network-icon';
import { Divider } from '../../common/divider';
import { List } from '../../common/list/list';
import { ListLabelValueItem } from '../../common/list/list-label-value-item';
import { ListVerticalLabelValueItem } from '../../common/list/list-vertical-label-value-item';
import { SendFormContext } from '../send-modal-context-provider';

// eslint-disable-next-line sonarjs/cognitive-complexity
export const SendConfirmationDetailList = () => {
  const { t } = useTranslation();
  const { sendConfirm, currency } = useContext(SendFormContext);
  const { isCurrencyTypeToken, currencySymbol, nativeCoinSymbol } =
    useCryptoCurrencySymbolsAndBalances(currency);
  const { findContactByAddress } = useAddressBook();
  const { coinSymbol } = currency;

  const txn = sendConfirm?.txn;
  const validatedAddressPair = sendConfirm?.validatedAddressPair;
  const delegatedFee = sendConfirm?.delegatedFee;
  const isL2 = validatedAddressPair?.isL2;

  // Calculate total Amount
  const totalFee = Big(txn?.feesEstimate ?? 0);

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

  // If token, displayed as "USDT" for L1 and "USDT (ETH)" for L2 (since
  // deducing the chain the token belongs to is not trivial)
  const currencyDisplayName = isCurrencyTypeToken
    ? currencySymbol + (isL2 ? ` (${nativeCoinSymbol})` : '')
    : nativeCoinSymbol;

  const alias = validatedAddressPair?.alias ?? '-';

  // The two can resolve to different contacts, e.g. an L1 address that maps to
  // an L2 identity saved under a separate name.
  const inputContact = validatedAddressPair?.userInputToAddress
    ? findContactByAddress(validatedAddressPair.userInputToAddress, coinSymbol)
    : undefined;
  const sendToContact = validatedAddressPair?.convertedToAddress
    ? findContactByAddress(validatedAddressPair.convertedToAddress, coinSymbol)
    : undefined;

  const feeCurrencyDisplayName =
    isCurrencyTypeToken && (isL2 || !!delegatedFee)
      ? currencySymbol + (isL2 ? ` (${nativeCoinSymbol})` : '')
      : nativeCoinSymbol;

  return (
    <>
      <List lines="none">
        <IonItem className={'ion-margin-bottom-xs'}>
          {isL2 ? (
            <L2Icon size={24} />
          ) : (
            <NetworkIcon size={24} chain={coinSymbol} />
          )}
          <IonText>
            <h3 className={'ion-text-size-md ion-margin-0 ion-margin-left-xs'}>
              {isL2
                ? t('Chain.AkashicChain')
                : NetworkDictionary[coinSymbol].displayName.replace(
                    /Chain/g,
                    ''
                  )}
            </h3>
          </IonText>
        </IonItem>
        <ListVerticalLabelValueItem
          label={t('InputAddress')}
          value={validatedAddressPair?.userInputToAddress}
          subContent={<AddressBookNameRow name={inputContact?.name} />}
        />
        <ListVerticalLabelValueItem
          label={t('SendTo')}
          value={validatedAddressPair?.convertedToAddress}
          subContent={<AddressBookNameRow name={sendToContact?.name} />}
        />
        <IonItem>
          <Divider
            style={{ width: '100%' }}
            className={'ion-margin-vertical'}
          />
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
          <ListLabelValueItem
            label={t('AkashicAlias')}
            value={alias}
            labelBold
          />
        </>
      </List>
    </>
  );
};
