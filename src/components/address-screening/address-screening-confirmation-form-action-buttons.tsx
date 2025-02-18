import type { IBaseAcTransaction } from '@helium-pay/backend';
import { otherError } from '@helium-pay/backend';
import { IonAlert, IonCol, IonRow } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  historyGoBackOrReplace,
  historyResetStackAndRedirect,
} from '../../routing/history';
import { useSendL2Transaction } from '../../utils/hooks/nitr0gen';
import type { ITransactionFailureResponse } from '../../utils/nitr0gen/nitr0gen.interface';
import { unpackRequestErrorMessage } from '../../utils/unpack-request-error-message';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../common/alert/alert';
import { PrimaryButton, WhiteButton } from '../common/buttons';
import { type AddressScanConfirmationTxnsDetail } from './types';

export const AddressScreeningConfirmationFormActionButtons = ({
  txnsDetail,
}: {
  txnsDetail: AddressScanConfirmationTxnsDetail;
}) => {
  const { t } = useTranslation();
  const { trigger: triggerSendL2Transaction } = useSendL2Transaction();

  const [forceAlert, setForceAlert] = useState(formAlertResetState);
  const [formAlert, setFormAlert] = useState(formAlertResetState);
  const [isLoading, setIsLoading] = useState(false);

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

      //TODO: 1293 - using normal L2 txn for now, should integrate with actual API (send to BE instead of nitrogen)
      const response = await triggerSendL2Transaction({
        ...txn,
        signedTx: signedTxn as IBaseAcTransaction,
      });

      if (!response.isSuccess) {
        throw new Error((response as ITransactionFailureResponse).reason);
      }

      // TODO: 1293 - redirect to scan detail page with given scan id
      historyResetStackAndRedirect();
      // historyReplace(urls.scanDetail, {
      //   id: response.id
      // });
    } catch (error) {
      const errorShell = errorAlertShell(unpackRequestErrorMessage(error));
      if (
        [otherError.signingError, otherError.providerError].includes(
          (error as Error).message
        )
      ) {
        setFormAlert(errorShell);
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
    </>
  );
};
