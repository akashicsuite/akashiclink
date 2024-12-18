import styled from '@emotion/styled';
import { FeeDelegationStrategy } from '@helium-pay/backend';
import { IonCol, IonRow } from '@ionic/react';
import Big from 'big.js';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../../constants/urls';
import { history } from '../../../routing/history';
import { akashicPayPath } from '../../../routing/navigation-tabs';
import { useFocusCurrencySymbolsAndBalances } from '../../../utils/hooks/useAggregatedBalances';
import { useVerifyTxnAndSign } from '../../../utils/hooks/useVerifyTxnAndSign';
import { errorAlertShell, type FormAlertState } from '../../common/alert/alert';
import { WhiteButton } from '../../common/buttons';
import { Divider } from '../../common/divider';
import { List } from '../../common/list/list';
import { ListLabelValueAmountItem } from '../../common/list/list-label-value-amount-item';
import { ListLabelValueItem } from '../../common/list/list-label-value-item';
import { Tooltip } from '../../common/tooltip';
import type { ValidatedAddressPair } from './types';

const StyledWhiteButton = styled(WhiteButton)<{ backgroundColor?: string }>`
  ::part(native) {
    font-size: 8px;
    height: 32px;
  }
`;

export const SendTxnDetailBoxWithDelegateOption = ({
  validatedAddressPair,
  amount,
  disabled,
  setAlert,
  onAddressReset,
}: {
  validatedAddressPair: ValidatedAddressPair;
  amount: string;
  disabled: boolean;
  setAlert: Dispatch<SetStateAction<FormAlertState>>;
  onAddressReset: () => void;
}) => {
  const { t } = useTranslation();
  const {
    isCurrencyTypeToken,
    nativeCoinBalance,
    nativeCoinSymbol,
    chain,
    token,
    delegatedFee,
  } = useFocusCurrencySymbolsAndBalances();

  const canDelegate = isCurrencyTypeToken;
  // TODO: perform a more accurate checking to see if nativeCoinBalance is enough to pay gas fee
  const canNonDelegate = Big(nativeCoinBalance).gt(0);

  const [isLoading, setIsLoading] = useState(false);

  const verifyTxnAndSign = useVerifyTxnAndSign();

  const onConfirm = (isDelegated: boolean) => async () => {
    try {
      setIsLoading(true);

      const res = await verifyTxnAndSign(
        validatedAddressPair,
        amount,
        chain,
        token,
        isDelegated
          ? FeeDelegationStrategy.Delegate
          : FeeDelegationStrategy.None
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
            feeDelegationStrategy: isDelegated
              ? FeeDelegationStrategy.Delegate
              : FeeDelegationStrategy.None,
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
    <IonRow className={'ion-grid-row-gap-sm'}>
      <IonCol size={'12'}>
        <List lines="none" bordered compact>
          <IonRow className={'ion-grid-gap-xxs'}>
            <IonCol size={'8'}>
              {validatedAddressPair.alias && (
                <ListLabelValueItem
                  label={t('AkashicAlias')}
                  value={validatedAddressPair.alias}
                  labelBold
                />
              )}
              <ListLabelValueAmountItem
                label={
                  <div
                    className={'ion-align-items-center'}
                    style={{ display: 'inline-flex' }}
                  >
                    <span>{t('DelegatedGasFee')}</span>
                    <Tooltip content={t('DelegatedFeeDetail')} />
                  </div>
                }
                value={Big(delegatedFee).toString()}
                amount={amount}
                fee={delegatedFee}
                valueShorten
              />
              <ListLabelValueAmountItem
                label={t('Total')}
                value={Big(amount).add(delegatedFee).toString()}
                amount={amount}
                fee={delegatedFee}
                valueShorten
              />
            </IonCol>
            <IonCol size={'4'} className={'ion-center'}>
              <StyledWhiteButton
                expand="block"
                className={'w-100 ion-margin-right-xxs'}
                onClick={onConfirm(true)}
                disabled={isLoading || disabled || !canDelegate}
                isLoading={isLoading}
              >
                {!isLoading ? t('Delegated') : ''}
              </StyledWhiteButton>
            </IonCol>
          </IonRow>
          <Divider className={'ion-margin-left-xxs ion-margin-right-xxs'} />
          <IonRow className={'ion-grid-gap-xxs'}>
            <IonCol size={'8'}>
              {validatedAddressPair.alias && (
                <ListLabelValueItem
                  label={t('AkashicAlias')}
                  value={validatedAddressPair.alias}
                  labelBold
                />
              )}
              <ListLabelValueItem
                label={t('GasFee')}
                value={t(
                  canNonDelegate ? 'CalculateOnNextStep' : 'CannotNonDelegate'
                )}
                valueDim
                labelBold
                valueShorten
              />
              <ListLabelValueAmountItem
                label={t('Total')}
                value={amount}
                amount={amount}
                fee={delegatedFee}
                valueShorten
              />
            </IonCol>
            <IonCol size={'4'} className={'ion-center'}>
              <StyledWhiteButton
                expand="block"
                className={'w-100 ion-margin-right-xxs'}
                onClick={onConfirm(false)}
                disabled={isLoading || disabled || !canNonDelegate}
                isLoading={isLoading}
              >
                {!isLoading ? t('NonDelegated') : ''}
              </StyledWhiteButton>
            </IonCol>
          </IonRow>
        </List>
      </IonCol>
    </IonRow>
  );
};
