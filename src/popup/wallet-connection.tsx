import { CoinSymbol } from '@helium-pay/backend';
import { IonCol, IonRow } from '@ionic/react';
import { getInternalError, getSdkError } from '@walletconnect/utils';
import { type Web3WalletTypes } from '@walletconnect/web3wallet';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mainnet, sepolia } from 'viem/chains';

import { BorderedBox } from '../components/common/box/border-box';
import { OutlineButton, PrimaryButton } from '../components/common/buttons';
import { AccountListItem } from '../components/manage-account/account-list-item';
import { PopupLayout } from '../components/page-layout/popup-layout';
import { useAppSelector } from '../redux/app/hooks';
import { selectTheme } from '../redux/slices/preferenceSlice';
import {
  closePopup,
  ETH_METHOD,
  EXTENSION_ERROR,
  EXTENSION_EVENT,
  responseToSite,
} from '../utils/chrome';
import { useAccountStorage } from '../utils/hooks/useLocalAccounts';
import { useOwnerKeys } from '../utils/hooks/useOwnerKeys';
import { useSetGlobalLanguage } from '../utils/hooks/useSetGlobalLanguage';
import { useSignAuthorizeActionMessage } from '../utils/hooks/useSignAuthorizeActionMessage';
import {
  buildApproveSessionNamespace,
  useWeb3Wallet,
} from '../utils/web3wallet';
import { ConnectionBackButton } from './connection-back-button';

const chain =
  process.env.REACT_APP_ENABLE_TESTNET_CURRENCIES === 'true'
    ? sepolia
    : mainnet;

export function WalletConnection() {
  const { t } = useTranslation();

  // retrieve user AL setting
  const storedTheme = useAppSelector(selectTheme);
  const [globalLanguage] = useSetGlobalLanguage();

  const searchParams = new URLSearchParams(window.location.search);
  const uri = searchParams.get('uri') ?? '';

  const web3wallet = useWeb3Wallet();

  const { activeAccount } = useAccountStorage();
  const { keys: addresses } = useOwnerKeys(activeAccount?.identity ?? '');

  const signAuthorizeActionMessage = useSignAuthorizeActionMessage();

  const activeAccountL1Address =
    addresses?.find(
      (address) =>
        address.coinSymbol === CoinSymbol.Ethereum_Sepolia ||
        address.coinSymbol === CoinSymbol.Ethereum_Mainnet
    )?.address ?? '';

  const [sessionProposalId, setSessionProposalId] = useState<
    number | undefined
  >();
  const [sessionProposal, setSessionProposal] = useState<
    Web3WalletTypes.SessionProposal | undefined
  >();
  const [sessionRequest, setSessionRequest] = useState<
    Web3WalletTypes.SessionRequest | undefined
  >();
  const [isProcessing, setIsProcessing] = useState(false);

  const approve = async () => {
    setIsProcessing(true);

    try {
      if (!sessionProposalId || !sessionProposal) {
        throw new Error(EXTENSION_ERROR.WC_SESSION_NOT_FOUND);
      }

      if (!activeAccountL1Address) {
        throw new Error(EXTENSION_ERROR.COULD_NOT_READ_ADDRESS);
      }

      const approvedNamespaces = buildApproveSessionNamespace({
        sessionProposal,
        chain,
        l1Address: activeAccountL1Address,
      });

      await web3wallet?.approveSession({
        id: sessionProposalId,
        namespaces: approvedNamespaces,
      });
    } catch (e) {
      console.warn('Failed to connect', e);
      responseToSite({
        method: ETH_METHOD.REQUEST_ACCOUNTS,
        error:
          activeAccountL1Address === ''
            ? EXTENSION_ERROR.COULD_NOT_READ_ADDRESS
            : EXTENSION_ERROR.WC_SESSION_NOT_FOUND,
      });
      window.removeEventListener('beforeunload', onPopupClosed);
      await closePopup();
    }
  };

  const reject = async () => {
    setIsProcessing(true);

    sessionProposalId &&
      (await web3wallet?.rejectSession({
        id: sessionProposalId,
        reason: getSdkError('USER_REJECTED'),
      }));
  };

  const onSessionProposal = useCallback(
    async ({ id, params, ...props }: Web3WalletTypes.SessionProposal) => {
      setSessionProposalId(id);
      setSessionProposal({ id, params, ...props });
    },
    [addresses.length, chain, web3wallet]
  );

  useEffect(() => {
    const responseIdentityToSite = async (
      event: Web3WalletTypes.SessionRequest
    ) => {
      const { topic, id, params } = event;
      const method = params.request.method;

      if (method !== ETH_METHOD.PERSONAL_SIGN) {
        await closePopup();
      }

      const payloadToSign = {
        identity: activeAccount?.identity ?? '',
        expires: Date.now() + 60 * 1000,
      };

      const walletPreference = {
        theme: storedTheme,
        language: globalLanguage.replace('-', '='), // use replace for backward compatible with "-"
      };

      const signedMsg = await signAuthorizeActionMessage(payloadToSign);

      await web3wallet?.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result: `${signedMsg}-${JSON.stringify(
            payloadToSign
          )}-${JSON.stringify(walletPreference)}`,
        },
      });

      // Need this setTimeout for respondSessionRequest to completely finish before closing itself
      setTimeout(() => {
        window.removeEventListener('beforeunload', onPopupClosed);
        closePopup();
      }, 100);
    };

    sessionRequest && responseIdentityToSite(sessionRequest);
  }, [sessionRequest]);

  const onSessionRequest = useCallback(
    async (event: Web3WalletTypes.SessionRequest) => {
      setSessionRequest(event);
    },
    []
  );

  // Do NOT remove useCallback for removeEventListener to work
  const onPopupClosed = useCallback(() => {
    // TODO: explore chrome.windows.onRemoved.addListener
    responseToSite({
      method: ETH_METHOD.REQUEST_ACCOUNTS,
      event: EXTENSION_EVENT.USER_CLOSED_POPUP,
    });
  }, []);

  const onClickApproveConnect = async () => {
    await approve();
  };

  const onClickRejectConnect = async () => {
    try {
      await reject();
    } finally {
      window.removeEventListener('beforeunload', onPopupClosed);
      await closePopup();
    }
  };

  useEffect(() => {
    if (!web3wallet) {
      return;
    }

    const receivePairProposal = async () => {
      const activeSessions = web3wallet?.getActiveSessions();

      // Clean up old sessions
      if (activeSessions && Object.values(activeSessions).length > 0) {
        await Promise.all(
          Object.values(activeSessions).map((session) =>
            web3wallet?.disconnectSession({
              topic: session?.topic as string,
              reason: getInternalError('RESTORE_WILL_OVERRIDE'),
            })
          )
        );
      }

      await web3wallet?.pair({ uri });
    };

    responseToSite({
      method: ETH_METHOD.REQUEST_ACCOUNTS,
      event: EXTENSION_EVENT.POPUP_READY,
    });

    web3wallet.on('session_proposal', onSessionProposal);
    web3wallet.on('session_request', onSessionRequest);
    window.addEventListener('beforeunload', onPopupClosed);

    receivePairProposal();

    return () => {
      web3wallet?.off('session_proposal', onSessionProposal);
      web3wallet?.off('session_request', onSessionRequest);
      window.removeEventListener('beforeunload', onPopupClosed);
    };
  }, [onSessionProposal, web3wallet]);

  return (
    <PopupLayout showIdentity={false}>
      <IonRow>
        <IonCol size={'12'}>
          <ConnectionBackButton />
        </IonCol>
        <IonCol size={'12'}>
          <h2 className="ion-justify-content-center ion-margin-top-lg ion-margin-bottom-xs">
            {t('Permissions')}
          </h2>
          <p className="ion-justify-content-center ion-margin-bottom-sm ion-text-align-center">
            {t('AllowSite')}
          </p>
        </IonCol>
        <IonCol size={'12'}>
          <BorderedBox lines="full" className={'ion-margin-top-sm'}>
            <div className={'ion-padding-vertical'}>
              <p className="ion-justify-content-center ion-margin-bottom-md">
                {t('SeeAddressAccountBalance')}
              </p>
              <p className="ion-justify-content-center ion-margin-bottom-xxs">
                {t('RequestNowFor')}
              </p>
              {activeAccount && (
                <AccountListItem lines={'none'} account={activeAccount} />
              )}
            </div>
          </BorderedBox>
        </IonCol>
      </IonRow>
      <IonRow className={'ion-margin-top-auto'}>
        <IonCol size={'12'}>
          <IonRow>
            <IonCol size={'6'}>
              <OutlineButton
                expand="block"
                onClick={onClickRejectConnect}
                disabled={!sessionProposalId || isProcessing}
              >
                {t('Deny')}
              </OutlineButton>
            </IonCol>
            <IonCol size={'6'}>
              <PrimaryButton
                expand="block"
                onClick={onClickApproveConnect}
                isLoading={!sessionProposalId || isProcessing}
              >
                {t('Confirm')}
              </PrimaryButton>
            </IonCol>
          </IonRow>
        </IonCol>
      </IonRow>
    </PopupLayout>
  );
}
