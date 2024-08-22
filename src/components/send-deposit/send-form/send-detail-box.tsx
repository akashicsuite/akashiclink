import { L2Regex, NetworkDictionary } from '@helium-pay/backend';
import { IonCol, IonRow } from '@ionic/react';
import Big from 'big.js';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../redux/app/hooks';
import { selectFocusCurrencyDetail } from '../../../redux/slices/preferenceSlice';
import { getPrecision } from '../../../utils/formatAmount';
import { displayLongText } from '../../../utils/long-text';
import { L2Icon } from '../../common/chain-icon/l2-icon';
import { NetworkIcon } from '../../common/chain-icon/network-icon';
import { List } from '../../common/list/list';
import { ListLabelValueItem } from '../../common/list/list-label-value-item';
import type { ValidatedAddressPair } from './types';

export const SendDetailBox = ({
  validatedAddressPair,
  amount,
  fee,
  currencySymbol,
}: {
  validatedAddressPair: ValidatedAddressPair;
  amount: string;
  fee: string;
  currencySymbol: string;
}) => {
  const { t } = useTranslation();
  const { chain } = useAppSelector(selectFocusCurrencyDetail);

  const isL2 = L2Regex.exec(validatedAddressPair?.convertedToAddress);

  // fee is internal-fee here
  const precision = getPrecision(amount, fee ?? '0');

  return (
    <IonRow className={'ion-grid-row-gap-sm'}>
      <IonCol size={'12'}>
        <List lines="none" bordered compact>
          {validatedAddressPair.acnsAlias && (
            <ListLabelValueItem
              label={t('AkashicAlias')}
              value={validatedAddressPair.acnsAlias}
              labelBold
            />
          )}
          {isL2 &&
            validatedAddressPair.convertedToAddress !==
              validatedAddressPair.userInputToAddress && (
              <ListLabelValueItem
                label={t('AkashicAddress')}
                value={displayLongText(validatedAddressPair.convertedToAddress)}
                labelBold
              />
            )}
          <ListLabelValueItem
            label={t('Chain.Title')}
            value={
              isL2 ? (
                <div className={'ion-center ion-gap-xxs'}>
                  <L2Icon size={16} />
                  {t('Chain.AkashicChain')}
                </div>
              ) : (
                <div className={'ion-center ion-gap-xxs'}>
                  <NetworkIcon chain={chain} size={16} />
                  {NetworkDictionary[chain].displayName.replace(/Chain/g, '')}
                </div>
              )
            }
            labelBold
          />
          <ListLabelValueItem
            label={t(isL2 ? 'Fee' : 'GasFee')}
            value={
              isL2
                ? `${Big(fee).toFixed(precision)} ${currencySymbol}`
                : t('CalculateOnNextStep')
            }
            labelBold
          />
          <ListLabelValueItem
            label={t('Total')}
            value={`${Big(isL2 ? fee : '0')
              .add(amount)
              .toFixed(precision)} ${currencySymbol}`}
            labelBold
          />
        </List>
      </IonCol>
    </IonRow>
  );
};
