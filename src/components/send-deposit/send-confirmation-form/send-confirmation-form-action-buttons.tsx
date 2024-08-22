import type {
  IBaseTransactionWithDbIndex,
  ITerriTransaction,
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
import { OwnersAPI } from '../../../utils/api';
import { useSendL2Transaction } from '../../../utils/hooks/nitr0gen';
import { useInterval } from '../../../utils/hooks/useInterval';
import { useVerifyTxnAndSign } from '../../../utils/hooks/useVerifyTxnAndSign';
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

// eslint-disable-next-line sonarjs/cognitive-complexity
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
          txnsDetail.amount
        );

        if (typeof res === 'string') {
          setFormAlert(errorAlertShell(res));
          return;
        }

        setTxnsDetail({
          ...txnsDetail,
          txns: res.txns,
          signedTxns: res.signedTxns,
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

      if (
        !txnsDetail.txns ||
        !txnsDetail.txns[0] ||
        !txnsDetail?.signedTxns?.[0]
      ) {
        setFormAlert(errorAlertShell('GenericFailureMsg'));
        return;
      }
      setIsLoading(true);

      const { txToSign: _, ...txn } = txnsDetail.txns[0];
      const signedTxn = txnsDetail?.signedTxns[0];

      const response = isL2
        ? await triggerSendL2Transaction({
            ...txn,
            signedTx: signedTxn as IBaseTransactionWithDbIndex,
            initiatedToNonL2:
              txnsDetail.validatedAddressPair.initiatedToNonL2 ?? '',
          })
        : await OwnersAPI.sendL1TransactionUsingClientSideOtk([
            {
              ...txn,
              signedTx: signedTxn as ITerriTransaction,
            },
          ]);

      const res = Array.isArray(response) ? response[0] : response;

      if (!res.isSuccess) {
        throw new Error(res.reason);
      }

      setTxnFinal({
        txHash: res.txHash,
        feesEstimate: res.feesEstimate,
      });
      if (history.location.state.sendConfirm) {
        historyReplace(urls.sendConfirm, {
          sendConfirm: {
            ...history.location.state.sendConfirm,
            txnFinal: {
              txHash: res.txHash,
              feesEstimate: res.feesEstimate,
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
