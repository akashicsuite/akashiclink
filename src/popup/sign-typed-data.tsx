import type { ICallbackUrls } from '@helium-pay/backend';
import { IonCol, IonRow, IonSpinner } from '@ionic/react';
import { getSdkError } from '@walletconnect/utils';
import { type Web3WalletTypes } from '@walletconnect/web3wallet';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BorderedBox } from '../components/common/box/border-box';
import { PrimaryButton } from '../components/common/buttons';
import { List } from '../components/common/list/list';
import { ListVerticalLabelValueItem } from '../components/common/list/list-vertical-label-value-item';
import { PopupLayout } from '../components/page-layout/popup-layout';
import {
  closePopup,
  ETH_METHOD,
  EXTENSION_ERROR,
  EXTENSION_EVENT,
  responseToSite,
  TYPED_DATA_PRIMARY_TYPE,
} from '../utils/chrome';
import type { BecomeBpToSign } from '../utils/hooks/useSignBecomeBpMessage';
import { useSignBecomeBpMessage } from '../utils/hooks/useSignBecomeBpMessage';
import type { RetryCallbackToSign } from '../utils/hooks/useSignRetryCallback';
import { useSignRetryCallback } from '../utils/hooks/useSignRetryCallback';
import type { SetCallbackUrlsToSign } from '../utils/hooks/useSignSetupCallbackUrl';
import { useSignSetupCallbackUrl } from '../utils/hooks/useSignSetupCallbackUrl';
import { useWeb3Wallet } from '../utils/web3wallet';

export function SignTypedData() {
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(window.location.search);

  const web3wallet = useWeb3Wallet();

  const [requestContent, setRequestContent] = useState({
    id: 0,
    method: '',
    topic: '',
    primaryType: '',
    message: {} as Record<string, string>,
    toSign: {} as Record<string, unknown>,
    response: {},
  });

  const signBecomeBpMessage = useSignBecomeBpMessage();
  const signSetupCallbackUrl = useSignSetupCallbackUrl();
  const signRetryCallback = useSignRetryCallback();

  const onSessionRequest = useCallback(
    async (event: Web3WalletTypes.SessionRequest) => {
      const { topic, params, id } = event;
      const { request } = params;

      if (request.method === ETH_METHOD.SIGN_TYPED_DATA) {
        const typedData = JSON.parse(request.params[1]);

        const { toSign, ...message } = typedData.message;

        setRequestContent({
          id,
          method: request.method,
          message: message,
          primaryType: typedData.primaryType,
          topic,
          toSign: toSign,
          response: {},
        });
      }
    },
    []
  );

  const onSessionRequestExpire = useCallback(async () => {
    await closePopup();
  }, []);

  const acceptSessionRequest = async () => {
    const { topic, id, primaryType, toSign } = requestContent;

    try {
      let signedMsg = '';

      switch (primaryType) {
        case TYPED_DATA_PRIMARY_TYPE.BECOME_BP:
          signedMsg = await signBecomeBpMessage({
            identity: toSign.identity,
            expires: Number(toSign.expires),
          } as BecomeBpToSign);
          break;
        case TYPED_DATA_PRIMARY_TYPE.RETRY_CALLBACK:
          signedMsg = await signRetryCallback({
            ...toSign,
            expires: Number(toSign.expires),
          } as RetryCallbackToSign);
          break;
        case TYPED_DATA_PRIMARY_TYPE.SETUP_CALLBACK_URL: {
          const callbackUrls: ICallbackUrls = {};
          if (toSign.deposit) {
            callbackUrls.deposit = toSign.deposit as string;
          }
          if (toSign.payout) {
            callbackUrls.payout = toSign.payout as string;
          }
          if (toSign.pendingDeposit) {
            callbackUrls.pendingDeposit = toSign.pendingDeposit as string;
          }

          signedMsg = await signSetupCallbackUrl({
            identity: toSign.identity,
            expires: Number(toSign.expires),
            callbackUrls,
          } as SetCallbackUrlsToSign);
          break;
        }
        default:
          throw new Error('Unreachable');
      }

      await web3wallet?.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result: signedMsg,
        },
      });
    } catch (e) {
      await web3wallet?.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          error: getSdkError('INVALID_METHOD'),
        },
      });
    }
  };
  const rejectSessionRequest = async () => {
    const { topic, id } = requestContent;

    await web3wallet?.respondSessionRequest({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        error: getSdkError('USER_REJECTED'),
      },
    });
  };

  // Do NOT remove useCallback for removeEventListener to work
  const onPopupClosed = useCallback(() => {
    rejectSessionRequest();
    responseToSite({
      method: ETH_METHOD.SIGN_TYPED_DATA,
      event: EXTENSION_EVENT.USER_CLOSED_POPUP,
    });
  }, []);

  const onClickSign = async () => {
    window.removeEventListener('beforeunload', onPopupClosed);
    await acceptSessionRequest();
    await closePopup();
  };

  const onClickReject = async () => {
    window.removeEventListener('beforeunload', onPopupClosed);
    await rejectSessionRequest();
    await closePopup();
  };

  useEffect(() => {
    if (!web3wallet) {
      return;
    }
    const activeSessions = web3wallet?.getActiveSessions();

    if (!activeSessions || Object.values(activeSessions).length === 0) {
      // TODO: perhaps an error page?
      responseToSite({
        method: ETH_METHOD.SIGN_TYPED_DATA,
        error: EXTENSION_ERROR.WC_SESSION_NOT_FOUND,
      });
      closePopup();
      return;
    }

    responseToSite({
      method: ETH_METHOD.SIGN_TYPED_DATA,
      event: EXTENSION_EVENT.POPUP_READY,
    });

    web3wallet.on('session_request', onSessionRequest);
    web3wallet.on('session_request_expire', onSessionRequestExpire);
    window.addEventListener('beforeunload', onPopupClosed);

    return () => {
      web3wallet?.off('session_request', onSessionRequest);
      window.removeEventListener('beforeunload', onPopupClosed);
    };
  }, [onSessionRequest, web3wallet]);

  const isWaitingRequestContent = requestContent.method === '';

  return (
    <PopupLayout>
      <IonRow>
        <IonCol size={'8'} offset={'2'}>
          <BorderedBox lines="full" compact>
            <h4 className="w-100 ion-justify-content-center ion-margin-0">
              {searchParams.get('appUrl') ?? '-'}
            </h4>
          </BorderedBox>
        </IonCol>
        <IonCol size={'12'}>
          <h2 className="ion-justify-content-center ion-margin-top-lg ion-margin-bottom-xs">
            {t('SignatureRequest')}
          </h2>
          <p className="ion-justify-content-center ion-margin-bottom-sm ion-text-align-center">
            {t('OnlySignThisMessageIfYouFullyUnderstand')}
          </p>
        </IonCol>
        <IonCol size={'12'}>
          {isWaitingRequestContent && <IonSpinner name="circular"></IonSpinner>}
          <List lines={'none'}>
            {Object.entries(requestContent?.message).map(([key, value]) => (
              <ListVerticalLabelValueItem
                key={key}
                label={t(`Popup.${key}`)}
                value={value ?? '-'}
              />
            ))}
          </List>
        </IonCol>
      </IonRow>
      <IonRow className={'ion-margin-top-auto'}>
        <IonCol size={'6'}>
          <PrimaryButton
            expand="block"
            disabled={isWaitingRequestContent}
            onClick={onClickReject}
          >
            {t('Deny')}
          </PrimaryButton>
        </IonCol>
        <IonCol size={'6'}>
          <PrimaryButton
            expand="block"
            disabled={isWaitingRequestContent}
            onClick={onClickSign}
          >
            {t('Confirm')}
          </PrimaryButton>
        </IonCol>
      </IonRow>
    </PopupLayout>
  );
}
