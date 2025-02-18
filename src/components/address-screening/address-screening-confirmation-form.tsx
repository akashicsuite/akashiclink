import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import type { LocationState } from '../../routing/history';
import { AddressScreeningConfirmationDetailList } from './address-screening-confirmation-detail-list';
import { AddressScreeningConfirmationFormActionButtons } from './address-screening-confirmation-form-action-buttons';
import { type AddressScanConfirmationTxnsDetail } from './types';

export const AddressScreeningConfirmationForm = () => {
  const { t } = useTranslation();
  const history = useHistory<LocationState>();

  // TODO: 1293 - remove setter after whole integration flow is confirmed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [txnDetail, setTxnDetail] = useState<
    AddressScanConfirmationTxnsDetail | undefined
  >(history.location.state?.addressScanConfirm ?? undefined);

  // check if coming back from send page, and make ts happy
  if (!history.location.state?.addressScanConfirm) {
    return null;
  }

  return (
    <IonGrid
      className={
        'ion-grid-gap-xs ion-padding-top-xxs ion-padding-bottom-xxs ion-padding-left-md ion-padding-right-md'
      }
    >
      <IonRow>
        <IonCol className={'ion-text-align-center'} size={'12'}>
          <IonText>
            <h2 className="ion-margin-0">{t('PaymentConfirmation')}</h2>
          </IonText>
        </IonCol>
        <IonCol size={'12'}>
          {txnDetail?.txn && txnDetail?.validatedScanAddress && (
            <AddressScreeningConfirmationDetailList
              txnsDetail={txnDetail}
              validatedScanAddress={txnDetail.validatedScanAddress}
            />
          )}
        </IonCol>
      </IonRow>
      {txnDetail && (
        <AddressScreeningConfirmationFormActionButtons txnsDetail={txnDetail} />
      )}
    </IonGrid>
  );
};
