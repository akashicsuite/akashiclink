import {
  type CoinSymbol,
  type CurrencySymbol,
  L2Regex,
} from '@helium-pay/backend';
import { IonCol, IonRow, IonSpinner } from '@ionic/react';
import { getSdkError } from '@walletconnect/utils';
import { type Web3WalletTypes } from '@walletconnect/web3wallet';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BorderedBox } from '../components/common/box/border-box';
import { OutlineButton, PrimaryButton } from '../components/common/buttons';
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
import {
  useSendL1Transaction,
  useSendL2Transaction,
} from '../utils/hooks/nitr0gen';
import { useGenerateSecondaryOtk } from '../utils/hooks/useGenerateSecondaryOtk';
import { useSignAuthorizeActionMessage } from '../utils/hooks/useSignAuthorizeActionMessage';
import { useVerifyTxnAndSign } from '../utils/hooks/useVerifyTxnAndSign';
import { useWeb3Wallet } from '../utils/web3wallet';

export function SignTypedData() {
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(window.location.search);

  const web3wallet = useWeb3Wallet();

  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  const [requestContent, setRequestContent] = useState({
    id: 0,
    method: '',
    topic: '',
    primaryType: '',
    message: {} as Record<string, string>,
    toSign: {} as { identity: string; expires: string } & Record<
      string,
      string | Record<string, string>
    >,
    secondaryOtk: {} as { oldPubKeyToRemove?: string },
    response: {},
  });

  const signAuthorizeActionMessage = useSignAuthorizeActionMessage();
  const generateSecondaryOtk = useGenerateSecondaryOtk();

  const verifyTxnAndSign = useVerifyTxnAndSign();
  const { trigger: triggerSendL2Transaction } = useSendL2Transaction();
  const { trigger: triggerSendL1Transaction } = useSendL1Transaction();

  const onSessionRequest = useCallback(
    async (event: Web3WalletTypes.SessionRequest) => {
      const { topic, params, id } = event;
      const { request } = params;

      if (request.method === ETH_METHOD.SIGN_TYPED_DATA) {
        const typedData = JSON.parse(request.params[1]);

        const { toSign, secondaryOtk, ...message } = typedData.message;

        setRequestContent({
          id,
          method: request.method,
          message: message,
          primaryType: typedData.primaryType,
          topic,
          toSign: toSign,
          secondaryOtk,
          response: {},
        });
      }
    },
    []
  );

  const onSessionRequestExpire = useCallback(async () => {
    await closePopup();
  }, []);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const acceptSessionRequest = async () => {
    const { topic, id, primaryType, toSign, secondaryOtk } = requestContent;

    try {
      let signedMsg = '';

      switch (primaryType) {
        case TYPED_DATA_PRIMARY_TYPE.AUTHORIZE_ACTION:
          signedMsg = await signAuthorizeActionMessage({
            ...toSign,
            identity: toSign.identity,
            expires: Number(toSign.expires),
          });
          break;
        case TYPED_DATA_PRIMARY_TYPE.GENERATE_SECONDARY_OTK:
          signedMsg = await generateSecondaryOtk(secondaryOtk);
          break;
        case TYPED_DATA_PRIMARY_TYPE.PAYOUT: {
          // TODO: Fix all this casting
          const res = await verifyTxnAndSign(
            {
              userInputToAddress: toSign.addressInput as string,
              convertedToAddress: toSign.convertedToAddress as string,
              acnsAlias: toSign.acnsAlias as string,
            },
            toSign.amount as string,
            toSign.chain as CoinSymbol,
            toSign.token as CurrencySymbol | undefined
          );

          if (typeof res === 'string') {
            throw new Error(res);
          }

          const didUserInputL2Address = L2Regex.exec(
            toSign.addressInput as string
          );

          const { txn, signedTxn: signedTx } = res;

          const response =
            toSign.isL2 === 'true'
              ? await triggerSendL2Transaction({
                  ...txn,
                  signedTx,
                  initiatedToNonL2: !didUserInputL2Address
                    ? (toSign.addressInput as string)
                    : undefined,
                })
              : await triggerSendL1Transaction({
                  ...txn,
                  signedTx,
                });

          if (!response.isSuccess) {
            throw new Error(response.reason);
          }

          signedMsg = `0x${response.txHash}`;
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
      try {
        await web3wallet?.respondSessionRequest({
          topic,
          response: {
            id,
            jsonrpc: '2.0',
            error: getSdkError('INVALID_METHOD'),
          },
        });
      } finally {
        responseToSite({
          method: ETH_METHOD.SIGN_TYPED_DATA,
          error: EXTENSION_ERROR.UNKNOWN,
        });
      }
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
    setIsProcessingRequest(true);
    window.removeEventListener('beforeunload', onPopupClosed);
    await acceptSessionRequest();
    setIsProcessingRequest(false);
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
        <IonCol
          size={'12'}
          className={'ion-justify-content-center ion-align-items-center'}
        >
          {isWaitingRequestContent && (
            <IonSpinner
              className={'w-100 ion-margin-top-xl'}
              color="secondary"
              name="circular"
            />
          )}
          <List lines={'none'}>
            {/* // TODO: prepare array of display to do render */}
            {Object.entries(
              requestContent?.message?.toDisplay ??
                requestContent?.message ??
                {}
            ).map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map((v) =>
                  Object.entries(v).map(([key, value]) => {
                    if (value) {
                      return (
                        <ListVerticalLabelValueItem
                          key={key}
                          label={t(`Popup.${key}`)}
                          value={(value as string) ?? '-'}
                        />
                      );
                    }
                  })
                );
              } else if (typeof value === 'object') {
                return Object.entries(value).map(([key, value]) => {
                  if (value) {
                    return (
                      <ListVerticalLabelValueItem
                        key={key}
                        label={t(`Popup.${key}`)}
                        value={(value as string) ?? '-'}
                      />
                    );
                  }
                });
              } else if (value !== '') {
                return (
                  <ListVerticalLabelValueItem
                    key={key}
                    label={t(`Popup.${key}`)}
                    value={value ?? '-'}
                  />
                );
              }
            })}
          </List>
        </IonCol>
      </IonRow>
      <IonRow className={'ion-margin-top-auto'}>
        <IonCol size={'6'}>
          <OutlineButton
            expand="block"
            disabled={isWaitingRequestContent || isProcessingRequest}
            onClick={onClickReject}
          >
            {t('Deny')}
          </OutlineButton>
        </IonCol>
        <IonCol size={'6'}>
          <PrimaryButton
            expand="block"
            isLoading={isWaitingRequestContent || isProcessingRequest}
            onClick={onClickSign}
          >
            {t('Confirm')}
          </PrimaryButton>
        </IonCol>
      </IonRow>
    </PopupLayout>
  );
}
