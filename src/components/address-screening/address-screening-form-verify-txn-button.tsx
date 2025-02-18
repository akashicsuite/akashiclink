import styled from '@emotion/styled';
import {
  type CoinSymbol,
  type CurrencySymbol,
  FeeDelegationStrategy,
} from '@helium-pay/backend';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../constants/urls';
import { history } from '../../routing/history';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { useFocusCurrencySymbolsAndBalances } from '../../utils/hooks/useAggregatedBalances';
import { useConfig } from '../../utils/hooks/useConfig';
import { useVerifyTxnAndSign } from '../../utils/hooks/useVerifyTxnAndSign';
import type { FormAlertState } from '../common/alert/alert';
import { errorAlertShell } from '../common/alert/alert';
import { PrimaryButton } from '../common/buttons';
import type { ValidatedScanAddress } from './types';

const StyledPrimaryButton = styled(PrimaryButton)`
  ::part(native) {
    font-size: 12px;
    height: 32px;
  }
`;

export const AddressScreeningFormVerifyTxnButton: FC<{
  validatedScanAddress: ValidatedScanAddress;
  disabled: boolean;
  onAddressReset: () => void;
  setAlert: Dispatch<SetStateAction<FormAlertState>>;
  chain: CoinSymbol;
  token: CurrencySymbol;
}> = ({
  validatedScanAddress,
  disabled,
  onAddressReset,
  setAlert,
  chain,
  token,
}) => {
  const { t } = useTranslation();
  const { nativeCoinSymbol } = useFocusCurrencySymbolsAndBalances();
  const { config, isLoading: isLoadingConfig } = useConfig();

  const [isLoading, setIsLoading] = useState(false);

  const verifyTxnAndSign = useVerifyTxnAndSign();

  const onConfirm = async () => {
    try {
      setIsLoading(true);

      if (!config) {
        setAlert(errorAlertShell('GenericFailureMsg'));
        return;
      }

      const res = await verifyTxnAndSign(
        {
          convertedToAddress:
            config?.addressScreeningFeeCollectorIdentity ?? '',
          userInputToAddress:
            config?.addressScreeningFeeCollectorIdentity ?? '',
          userInputToAddressType: 'l2',
          isL2: true,
        },
        config?.addressScreeningFee ?? '',
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
        pathname: akashicPayPath(urls.addressScreeningNewScanConfirm),
        state: {
          //TODO: 1293 - add in fields returned from endpoint
          addressScanConfirm: {
            txn: res.txn,
            signedTxn: res.signedTxn,
            validatedScanAddress: {
              ...validatedScanAddress,
              feeChain: chain,
              feeToken: token,
            },
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
    <StyledPrimaryButton
      expand="block"
      className={'w-100'}
      onClick={onConfirm}
      disabled={isLoading || isLoadingConfig || disabled}
      isLoading={isLoading || isLoadingConfig}
    >
      {t('Scan')}
    </StyledPrimaryButton>
  );
};
