import styled from '@emotion/styled';
import { L2Regex } from '@helium-pay/backend';
import type { InputChangeEventDetail, InputCustomEvent } from '@ionic/react';
import { IonChip, IonCol, IonInput, IonRow, IonText } from '@ionic/react';
import Big from 'big.js';
import { debounce } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFocusCurrencySymbolsAndBalances } from '../../../utils/hooks/useAggregatedBalances';
import { useCalculateFocusCurrencyL2WithdrawalFee } from '../../../utils/hooks/useExchangeRates';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../../common/alert/alert';
import { TextButton } from '../../common/buttons';
import { SendDetailBox } from './send-detail-box';
import { SendFormActionButtons } from './send-form-action-buttons';
import type { ValidatedAddressPair } from './types';

const CurrencyChip = styled(IonChip)({
  '--background': 'var(--ion-color-primary)',
  '--color': 'var(--ion-color-primary-contrast)',
  opacity: 1,
});

const AmountInput = styled(IonInput)({
  textAlign: 'center',
  border: 0,
  borderBottom: '1px solid var(--ion-select-border)',
  borderRadius: 0,
  fontSize: '1.5rem',
  fontWeight: 700,
  width: '100%',
});

export const SendAmountInputAndDetail = ({
  validatedAddressPair,
  onAddressReset,
}: {
  validatedAddressPair: ValidatedAddressPair;
  onAddressReset: () => void;
}) => {
  const { t } = useTranslation();
  const [alert, setAlert] = useState(formAlertResetState);
  const [amount, setAmount] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const handleBlur = () => setIsFocused(false);
  const handleFocus = () => setIsFocused(true);
  const {
    isCurrencyTypeToken,
    networkCurrencyCombinedDisplayName,
    currencyBalance,
    currencySymbol,
    nativeCoinBalance,
    nativeCoinSymbol,
  } = useFocusCurrencySymbolsAndBalances();

  const isL2 = L2Regex.exec(validatedAddressPair?.convertedToAddress);

  const calculateL2Fee = useCalculateFocusCurrencyL2WithdrawalFee();

  const isAmountLargerThanZero = amount !== '' && Big(amount).gt(0);

  const validateAmount = debounce(async (input: string) => {
    setAlert(formAlertResetState);

    const userInputAmount = Big(input);

    // amount must be larger then 0
    if (userInputAmount.lte(0)) {
      setAlert(errorAlertShell('amountLargerThenZero'));
      return;
    }

    // if L2, balance must be larger than amount + internal fee
    if (isL2) {
      const fee = calculateL2Fee();
      if (userInputAmount.gt(Big(currencyBalance ?? 0).sub(fee))) {
        setAlert(errorAlertShell('SavingsExceeded'));
        return;
      }

      return;
    }

    // if L1, balance must be larger than amount,
    // if native coin balance is zero/not enough to pay gas fee, gas fee will be delegated
    if (userInputAmount.gt(Big(currencyBalance ?? 0))) {
      setAlert(errorAlertShell('SavingsExceeded'));
    }

    // TODO: balance must be larger than amount + fee estimated
  }, 200);

  const onAmountChange = (e: InputCustomEvent<InputChangeEventDetail>) => {
    setAmount(e.target?.value?.toString() ?? '');

    if (typeof e.target?.value === 'string' && e.target?.value !== '') {
      validateAmount(e.target?.value);
    }
  };

  const onClickUseMax = () => {
    setAlert(formAlertResetState);
    setAmount(
      Big(currencyBalance)
        .sub(isL2 ? calculateL2Fee() : '0')
        .toString()
    );
  };

  return (
    <>
      <IonRow className={'ion-grid-row-gap-xs ion-center'}>
        <IonCol className={'ion-center'} size={'12'}>
          <CurrencyChip disabled>
            {networkCurrencyCombinedDisplayName}
          </CurrencyChip>
        </IonCol>
      </IonRow>
      <IonRow className={'ion-grid-row-gap-xxxs'}>
        <IonCol
          className={
            'ion-center ion-flex-direction-column ion-align-items-center'
          }
          offset={'2'}
          size={'8'}
        >
          <AmountInput
            placeholder={isFocused ? '' : '0.00'}
            type="number"
            inputmode={'decimal'}
            onIonInput={onAmountChange}
            value={amount}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <TextButton
            onClick={onClickUseMax}
            className={'ion-text-size-xs'}
            fill="clear"
          >
            <b>{t('UseMax')}</b>
          </TextButton>
          <IonText className={'ion-text-size-xs ion-text-align-center'}>
            <b>{`${t('Balance')}: ${Big(currencyBalance).toFixed(
              isCurrencyTypeToken ? 2 : 4
            )} ${currencySymbol}`}</b>
          </IonText>
          {!isL2 && isCurrencyTypeToken && (
            <IonText className={'ion-text-size-xs ion-text-align-center'}>
              <b>{`${t('AvailableGas')}: ${Big(nativeCoinBalance).toFixed(
                4
              )} ${nativeCoinSymbol}`}</b>
            </IonText>
          )}
        </IonCol>
      </IonRow>
      {isAmountLargerThanZero && (
        <SendDetailBox
          validatedAddressPair={validatedAddressPair}
          amount={amount}
          fee={calculateL2Fee()}
          isFeeDelegated={
            // TODO: perform a more accute checking to see if nativeCoinBalance is enough to pay gas fee
            !isL2 && isCurrencyTypeToken && Big(nativeCoinBalance).eq(0)
          }
          currencySymbol={networkCurrencyCombinedDisplayName}
        />
      )}
      {alert.visible && (
        <IonRow>
          <IonCol size={'12'}>
            <AlertBox state={alert} />
          </IonCol>
        </IonRow>
      )}
      {isAmountLargerThanZero && (
        <SendFormActionButtons
          validatedAddressPair={validatedAddressPair}
          onAddressReset={onAddressReset}
          amount={amount}
          disabled={alert.visible}
        />
      )}
    </>
  );
};
