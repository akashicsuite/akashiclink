import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { BRIDGE_MESSAGE } from '../../../types/bridge-types';
import { responseToSite } from '../../../utils/chrome';
import { akashicScanTransactionsUrl } from '../../../utils/formatTransfers';
import { useAccountMe } from '../../../utils/hooks/useAccountMe';
import { useMyTransfersInfinite } from '../../../utils/hooks/useMyTransfersInfinite';
import { ShareActionButton } from '../../activity/share-action-button';
import { PrimaryButton } from '../../common/buttons';
import { ErrorIconWithTitle } from '../../common/state-icon-with-title/error-icon-with-title';
import { SuccessfulIconWithTitle } from '../../common/state-icon-with-title/successful-icon-with-title';
import { SendFormContext } from '../send-modal-context-provider';
import { SendCompletedDetailList } from './send-completed-detail-list';

export const SendCompleted = () => {
  const { t } = useTranslation();
  const { setStep, sendConfirm, setSendConfirm, setIsModalOpen } =
    useContext(SendFormContext);
  const { mutateMyTransfers } = useMyTransfersInfinite();
  const { mutate: mutateAccountMe } = useAccountMe();

  const txnsDetail = sendConfirm;

  // check if coming back from send page, and make ts happy
  if (!txnsDetail?.txnFinal) {
    setStep(0);
    return null;
  }

  const onFinish = async () => {
    mutateMyTransfers();
    mutateAccountMe();
    setTimeout(() => {
      mutateMyTransfers();
      mutateAccountMe();
    }, 2000);
    setStep(0);
    setSendConfirm(undefined);
    setIsModalOpen(false);

    // Special handling for popup flow to notify the dapp of the transaction result
    const url = new URL(window.location.href);
    const idParam = url.searchParams.get('id');
    if (idParam) {
      await responseToSite(
        BRIDGE_MESSAGE.APPROVAL_DECISION,
        Number(idParam),
        true,
        sendConfirm?.txnFinal?.txHash
      );
    }
  };

  return (
    <IonGrid
      className={
        'ion-grid-gap-xs ion-padding-top-xxs ion-padding-bottom-xxs ion-padding-left-md ion-padding-right-md'
      }
    >
      <IonRow>
        <IonCol size={'12'}>
          <div className={'ion-display-flex ion-align-items-center'}>
            <div className={'ion-flex-1'}>
              {sendConfirm?.txnFinal?.txHash && (
                <SuccessfulIconWithTitle
                  size={24}
                  isHorizontal
                  title={t('TransactionSuccessful')}
                />
              )}
              {sendConfirm?.txnFinal?.error && (
                <ErrorIconWithTitle
                  size={24}
                  isHorizontal
                  title={t('TransactionFailed')}
                />
              )}
            </div>
            {sendConfirm?.txnFinal?.txHash && (
              <ShareActionButton
                link={`${akashicScanTransactionsUrl}/${sendConfirm.txnFinal.txHash}`}
              />
            )}
          </div>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size={'12'}>
          {txnsDetail?.txn && txnsDetail?.validatedAddressPair && (
            <SendCompletedDetailList />
          )}
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size={'12'}>
          <PrimaryButton onClick={onFinish} expand="block">
            {t('OK')}
          </PrimaryButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
