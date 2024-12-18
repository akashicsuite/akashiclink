import type {
  IBaseAcTransaction,
  ITerriAcTransaction,
} from '@helium-pay/backend';
import { otherError } from '@helium-pay/backend';
import { IonAlert, IonCol, IonRow } from '@ionic/react';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { ONE_DAY_MS, ONE_MINUTE_MS } from '../../../constants';
import { urls } from '../../../constants/urls';
import type { LocationState } from '../../../routing/history';
import {
  historyGoBackOrReplace,
  historyReplace,
  historyResetStackAndRedirect,
} from '../../../routing/history';
import {
  useSendL1Transaction,
  useSendL2Transaction,
} from '../../../utils/hooks/nitr0gen';
import { useInterval } from '../../../utils/hooks/useInterval';
import { useVerifyTxnAndSign } from '../../../utils/hooks/useVerifyTxnAndSign';
import type { ITransactionFailureResponse } from '../../../utils/nitr0gen/nitr0gen.interface';
import { unpackRequestErrorMessage } from '../../../utils/unpack-request-error-message';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../../common/alert/alert';
import { PrimaryButton, WhiteButton } from '../../common/buttons';
import type {
  SendConfirmationTxnFinal,
  SendConfirmationTxnsDetail,
} from '../send-form/types';

export const SendConfirmationFormActionButtons = ({
  txnFinal,
  txnsDetail,
  setTxnFinal,
  setTxnsDetail,
}: {
  txnFinal?: SendConfirmationTxnFinal;
  txnsDetail: SendConfirmationTxnsDetail;
  setTxnFinal: Dispatch<SetStateAction<SendConfirmationTxnFinal | undefined>>;
  setTxnsDetail: Dispatch<
    SetStateAction<SendConfirmationTxnsDetail | undefined>
  >;
}) => {
  const { t } = useTranslation();
  const history = useHistory<LocationState>();
  const { trigger: triggerSendL2Transaction } = useSendL2Transaction();
  const { trigger: triggerSendL1Transaction } = useSendL1Transaction();

  const [forceAlert, setForceAlert] = useState(formAlertResetState);
  const [formAlert, setFormAlert] = useState(formAlertResetState);
  const [isLoading, setIsLoading] = useState(false);

  const verifyTxnAndSign = useVerifyTxnAndSign();

  const isL2 = txnsDetail?.validatedAddressPair.isL2;

  // Re-verify txn every 1 mins if L1
  useInterval(
    async () => {
      try {
        // skip when there was an error / txn request in progress / txn completed
        if (forceAlert.visible || formAlert.visible || isLoading || txnFinal) {
          return;
        }

        setIsLoading(true);

        if (!txnsDetail.validatedAddressPair || !txnsDetail.amount) {
          setFormAlert(errorAlertShell('GenericFailureMsg'));
          return;
        }

        const res = await verifyTxnAndSign(
          txnsDetail.validatedAddressPair,
          txnsDetail.amount,
          txnsDetail.txn.coinSymbol,
          txnsDetail.txn.tokenSymbol,
          txnsDetail.feeDelegationStrategy
        );

        if (typeof res === 'string') {
          setFormAlert(errorAlertShell(res));
          return;
        }

        setTxnsDetail({
          ...txnsDetail,
          txn: res.txn,
          signedTxn: res.signedTxn,
          delegatedFee: res.delegatedFee,
        });
      } catch (e) {
        setFormAlert(errorAlertShell(unpackRequestErrorMessage(e)));
      } finally {
        setIsLoading(false);
      }
    },
    isL2 ? ONE_DAY_MS : ONE_MINUTE_MS
  ); // 1 min if L1, 24 hr if L2

  const onConfirm = async () => {
    try {
      setFormAlert(formAlertResetState);

      if (!txnsDetail.txn || !txnsDetail.signedTxn) {
        setFormAlert(errorAlertShell('GenericFailureMsg'));
        return;
      }
      setIsLoading(true);

      const { txToSign: _, ...txn } = txnsDetail.txn;
      const signedTxn = txnsDetail.signedTxn;

      const response = isL2
        ? await triggerSendL2Transaction({
            ...txn,
            signedTx: signedTxn as IBaseAcTransaction,
            initiatedToNonL2:
              txnsDetail.validatedAddressPair.initiatedToNonL2 ?? '',
          })
        : await triggerSendL1Transaction({
            ...txn,
            signedTx: signedTxn as ITerriAcTransaction,
            feeDelegationStrategy: txnsDetail.feeDelegationStrategy,
          });

      if (!response.isSuccess) {
        throw new Error((response as ITransactionFailureResponse).reason);
      }

      setTxnFinal({
        txHash: response.txHash,
        feesEstimate: response.feesEstimate,
        delegatedFee: txnsDetail.delegatedFee,
      });
      if (history.location.state.sendConfirm) {
        historyReplace(urls.sendConfirm, {
          sendConfirm: {
            ...history.location.state.sendConfirm,
            txnFinal: {
              txHash: response.txHash,
              feesEstimate: response.feesEstimate,
            },
          },
        });
      }
    } catch (error) {
      const errorShell = errorAlertShell(unpackRequestErrorMessage(error));
      if (
        [otherError.signingError, otherError.providerError].includes(
          (error as Error).message
        )
      ) {
        setFormAlert(errorShell);
        setTxnFinal({
          error: unpackRequestErrorMessage(error),
        });
      } else {
        setForceAlert(errorShell);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    historyGoBackOrReplace();
  };

  const onFinish = () => {
    historyResetStackAndRedirect();
  };

  return (
    <>
      <IonAlert
        isOpen={forceAlert.visible}
        header={t('GenericFailureMsg')}
        message={t(forceAlert.message)}
        backdropDismiss={false}
        buttons={[
          {
            text: t('OK'),
            role: 'confirm',
            handler: async () => {
              historyResetStackAndRedirect();
              return false; // make it non dismissable
            },
          },
        ]}
      />
      {formAlert.visible && (
        <IonRow>
          <IonCol size={'12'}>
            <AlertBox state={formAlert} />
          </IonCol>
        </IonRow>
      )}
      {!txnFinal && (
        <IonRow>
          <IonCol size={'6'}>
            <PrimaryButton
              isLoading={isLoading}
              onClick={onConfirm}
              expand="block"
            >
              {t('Confirm')}
            </PrimaryButton>
          </IonCol>
          <IonCol size={'6'}>
            <WhiteButton disabled={isLoading} onClick={onCancel} expand="block">
              {t('GoBack')}
            </WhiteButton>
          </IonCol>
        </IonRow>
      )}
      {txnFinal && (
        <IonRow>
          <IonCol size={'12'}>
            <PrimaryButton onClick={onFinish} expand="block">
              {t('OK')}
            </PrimaryButton>
          </IonCol>
        </IonRow>
      )}
    </>
  );
};
