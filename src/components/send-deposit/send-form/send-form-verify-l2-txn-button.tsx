import { FeeDelegationStrategy } from '@helium-pay/backend';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../../constants/urls';
import { useAppSelector } from '../../../redux/app/hooks';
import { selectFocusCurrencyDetail } from '../../../redux/slices/preferenceSlice';
import { history } from '../../../routing/history';
import { akashicPayPath } from '../../../routing/navigation-tabs';
import { useFocusCurrencySymbolsAndBalances } from '../../../utils/hooks/useAggregatedBalances';
import { useVerifyTxnAndSign } from '../../../utils/hooks/useVerifyTxnAndSign';
import type { FormAlertState } from '../../common/alert/alert';
import { errorAlertShell } from '../../common/alert/alert';
import { PrimaryButton } from '../../common/buttons';
import type { ValidatedAddressPair } from './types';

type SendFormActionButtonsProps = {
  validatedAddressPair: ValidatedAddressPair;
  amount: string;
  disabled: boolean;
  onAddressReset: () => void;
  setAlert: Dispatch<SetStateAction<FormAlertState>>;
};

export const SendFormVerifyL2TxnButton: FC<SendFormActionButtonsProps> = ({
  validatedAddressPair,
  amount,
  disabled,
  onAddressReset,
  setAlert,
}) => {
  const { t } = useTranslation();
  const { nativeCoinSymbol } = useFocusCurrencySymbolsAndBalances();
  const { chain, token } = useAppSelector(selectFocusCurrencyDetail);

  const [isLoading, setIsLoading] = useState(false);

  const verifyTxnAndSign = useVerifyTxnAndSign();

  const onConfirm = async () => {
    try {
      setIsLoading(true);

      const res = await verifyTxnAndSign(
        validatedAddressPair,
        amount,
        chain,
        token,
        FeeDelegationStrategy.None
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
    } catch {
      setAlert(errorAlertShell('GenericFailureMsg'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PrimaryButton
      expand="block"
      className={'w-100'}
      onClick={onConfirm}
      disabled={isLoading || disabled}
      isLoading={isLoading}
    >
      {t('Next')}
    </PrimaryButton>
  );
};
