import {
  IonCol,
  IonLabel,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonText,
} from '@ionic/react';
import Big from 'big.js';
import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ALLOWED_ADDRESS_SCAN_CURRENCY,
  makeWalletCurrency,
} from '../../constants/currencies';
import { useAggregatedBalances } from '../../utils/hooks/useAggregatedBalances';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../common/alert/alert';
import { Divider } from '../common/divider';
import { List } from '../common/list/list';
import { ListLabelValueItem } from '../common/list/list-label-value-item';
import { AddressScreeningFormVerifyTxnButton } from './address-screening-form-verify-txn-button';
import { type ValidatedScanAddress } from './types';

// TODO: 1293 - update this!! probably should get from api / not needed at all
const SCAN_FEE_AMOUNT = '1';

export const AddressScreeningSelectCurrency: FC<{
  validatedScanAddress: ValidatedScanAddress;
  onAddressReset: () => void;
}> = ({ validatedScanAddress, onAddressReset }) => {
  const { t } = useTranslation();

  const [disabled, setDisabled] = useState(false);
  const [alert, setAlert] = useState(formAlertResetState);
  const [selectedFeeCurrency, setSelectedFeeCurrency] = useState(
    ALLOWED_ADDRESS_SCAN_CURRENCY[0]
  );

  const aggregatedBalances = useAggregatedBalances();

  useEffect(() => {
    const balance =
      (aggregatedBalances.get(
        makeWalletCurrency(selectedFeeCurrency.chain, selectedFeeCurrency.token)
      ) as string) ?? '0';

    const isNotEnoughBalance = Big(balance).lte(0);
    setAlert(
      isNotEnoughBalance
        ? errorAlertShell('SavingsExceeded')
        : formAlertResetState
    );
    setDisabled(isNotEnoughBalance);
  }, [selectedFeeCurrency]);

  return (
    <>
      <IonRow className={'ion-grid-row-gap-sm ion-center'}>
        <IonCol className={'ion-center'} size={'12'}>
          <Divider horizontal />
        </IonCol>
      </IonRow>
      <IonRow className={'ion-grid-row-gap-xs ion-center'}>
        <IonCol className={'ion-text-align-center'} size={'12'}>
          <IonText>
            <p className="ion-text-align-center ion-margin-horizontal">
              {t('SelectScanFeeCurrency')}
            </p>
          </IonText>
        </IonCol>
        <IonCol className={'ion-center'} size={'12'}>
          <IonSegment
            value={`${selectedFeeCurrency.chain}-${selectedFeeCurrency.token}`}
          >
            {ALLOWED_ADDRESS_SCAN_CURRENCY.map((currency) => (
              <IonSegmentButton
                key={`${currency.chain}-${currency.token}`}
                value={`${currency.chain}-${currency.token}`}
                onClick={() => setSelectedFeeCurrency(currency)}
              >
                <IonLabel>{`${currency.token} (${currency.chain})`}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonCol>
      </IonRow>
      <IonRow className={'ion-grid-row-gap-sm ion-center'}>
        <IonCol size={'12'}>
          <List lines="none" bordered compact>
            <IonRow className={'ion-grid-gap-xxxs'}>
              <IonCol size={'8'}>
                <div className={'ion-margin-top-xxs'}>
                  <ListLabelValueItem
                    labelBold
                    label={t('Fee')}
                    value={`${SCAN_FEE_AMOUNT} ${selectedFeeCurrency.token} (${selectedFeeCurrency.chain})`}
                  />
                </div>
              </IonCol>
              <IonCol size={'4'} className={'ion-center'}>
                <AddressScreeningFormVerifyTxnButton
                  validatedScanAddress={validatedScanAddress}
                  disabled={disabled}
                  setAlert={setAlert}
                  chain={selectedFeeCurrency.chain}
                  token={selectedFeeCurrency.token}
                  onAddressReset={onAddressReset}
                />
              </IonCol>
            </IonRow>
          </List>
        </IonCol>
      </IonRow>
      {alert.visible && (
        <IonRow>
          <IonCol size={'12'}>
            <AlertBox state={alert} />
          </IonCol>
        </IonRow>
      )}
    </>
  );
};
