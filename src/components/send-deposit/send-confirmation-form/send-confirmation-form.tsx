import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import type { LocationState } from '../../../routing/history';
import { ErrorIconWithTitle } from '../../common/state-icon-with-title/error-icon-with-title';
import { SuccessfulIconWithTitle } from '../../common/state-icon-with-title/successful-icon-with-title';
import type {
  SendConfirmationTxnFinal,
  SendConfirmationTxnsDetail,
} from '../send-form/types';
import { SendConfirmationDetailList } from './send-confirmation-detail-list';
import { SendConfirmationFormActionButtons } from './send-confirmation-form-action-buttons';

// eslint-disable-next-line sonarjs/cognitive-complexity
export const SendConfirmationForm = () => {
  const { t } = useTranslation();
  const history = useHistory<LocationState>();

  const [txnFinal, setTxnFinal] = useState<
    SendConfirmationTxnFinal | undefined
  >(
    history.location.state?.sendConfirm?.txnFinal
      ? {
          ...history.location.state?.sendConfirm.txnFinal,
        }
      : undefined
  );
  const [txnsDetail, setTxnsDetail] = useState<
    SendConfirmationTxnsDetail | undefined
  >(history.location.state?.sendConfirm ?? undefined);

  // check if coming back from send page, and make ts happy
  if (!history.location.state?.sendConfirm) {
    return null;
  }

  return (
    <IonGrid
      className={
        'ion-grid-gap-xs ion-padding-top-xxs ion-padding-bottom-xxs ion-padding-left-md ion-padding-right-md'
      }
    >
      {txnFinal?.txHash && (
        <IonRow>
          <IonCol size={'12'}>
            <SuccessfulIconWithTitle
              size={24}
              isHorizontal
              title={t('TransactionSuccessful')}
            />
          </IonCol>
        </IonRow>
      )}
      {txnFinal?.error && (
        <IonRow>
          <IonCol size={'12'}>
            <ErrorIconWithTitle
              size={24}
              isHorizontal
              title={t('TransactionFailed')}
            />
          </IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol size={'12'}>
          {txnsDetail?.txn && txnsDetail?.validatedAddressPair && (
            <SendConfirmationDetailList
              txn={txnsDetail.txn}
              txnFinal={txnFinal}
              validatedAddressPair={txnsDetail.validatedAddressPair}
              delegatedFee={txnsDetail.delegatedFee}
            />
          )}
        </IonCol>
      </IonRow>
      {txnsDetail && (
        <SendConfirmationFormActionButtons
          txnFinal={txnFinal}
          txnsDetail={txnsDetail}
          setTxnsDetail={setTxnsDetail}
          setTxnFinal={setTxnFinal}
        />
      )}
    </IonGrid>
  );
};
