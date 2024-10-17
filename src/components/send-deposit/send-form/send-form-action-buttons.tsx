import { IonCol, IonRow } from '@ionic/react';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../../constants/urls';
import { useAppSelector } from '../../../redux/app/hooks';
import { selectFocusCurrencyDetail } from '../../../redux/slices/preferenceSlice';
import { history, historyGoBackOrReplace } from '../../../routing/history';
import { akashicPayPath } from '../../../routing/navigation-tabs';
import { useFocusCurrencySymbolsAndBalances } from '../../../utils/hooks/useAggregatedBalances';
import { useVerifyTxnAndSign } from '../../../utils/hooks/useVerifyTxnAndSign';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../../common/alert/alert';
import { PrimaryButton, WhiteButton } from '../../common/buttons';
import type { ValidatedAddressPair } from './types';

type SendFormActionButtonsProps = {
  validatedAddressPair: ValidatedAddressPair;
  amount: string;
  disabled: boolean;
  onAddressReset: () => void;
};

export const SendFormActionButtons: FC<SendFormActionButtonsProps> = ({
  validatedAddressPair,
  amount,
  disabled,
  onAddressReset,
}) => {
  const { t } = useTranslation();
  const { nativeCoinSymbol } = useFocusCurrencySymbolsAndBalances();
  const { chain, token } = useAppSelector(selectFocusCurrencyDetail);

  const [alert, setAlert] = useState(formAlertResetState);
  const [isLoading, setIsLoading] = useState(false);

  const verifyTxnAndSign = useVerifyTxnAndSign();

  const onConfirm = async () => {
    try {
      setIsLoading(true);

      const res = await verifyTxnAndSign(
        validatedAddressPair,
        amount,
        chain,
        token
      );
      if (typeof res === 'string') {
        setAlert(
          errorAlertShell(res, {
            coinSymbol: nativeCoinSymbol,
          })
        );
        return;
      }

      // once user leave this page, reset the form
      onAddressReset();
      history.push({
        pathname: akashicPayPath(urls.sendConfirm),
        state: {
          sendConfirm: {
            txn: res.txn,
            signedTxn: res.signedTxn,
            delegatedFee: res.delegatedFee,
            validatedAddressPair,
            amount,
          },
        },
      });
    } catch (e) {
      setAlert(errorAlertShell('GenericFailureMsg'));
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    historyGoBackOrReplace();
  };

  return (
    <>
      {alert.visible && (
        <IonRow>
          <IonCol size={'12'}>
            <AlertBox state={alert} />
          </IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol size={'6'}>
          <PrimaryButton
            expand="block"
            className={'w-100'}
            onClick={onConfirm}
            disabled={disabled || isLoading}
            isLoading={isLoading}
          >
            {t('Next')}
          </PrimaryButton>
        </IonCol>
        <IonCol size={'6'}>
          <WhiteButton
            disabled={isLoading}
            className={'w-100'}
            expand="block"
            onClick={onCancel}
          >
            {t('Cancel')}
          </WhiteButton>
        </IonCol>
      </IonRow>
    </>
  );
};
