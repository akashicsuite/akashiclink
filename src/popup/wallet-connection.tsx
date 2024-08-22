import { CoinSymbol } from '@helium-pay/backend';
import { IonCol, IonRow } from '@ionic/react';
import { getInternalError, getSdkError } from '@walletconnect/utils';
import { type Web3WalletTypes } from '@walletconnect/web3wallet';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sepolia } from 'viem/chains';

import { BorderedBox } from '../components/common/box/border-box';
import { PrimaryButton } from '../components/common/buttons';
import { AccountListItem } from '../components/manage-account/account-list-item';
import { PopupLayout } from '../components/page-layout/popup-layout';
import {
  closePopup,
  ETH_METHOD,
  EXTENSION_ERROR,
  EXTENSION_EVENT,
  responseToSite,
} from '../utils/chrome';
import { useAccountStorage } from '../utils/hooks/useLocalAccounts';
import { useOwnerKeys } from '../utils/hooks/useOwnerKeys';
import {
  buildApproveSessionNamespace,
  useWeb3Wallet,
} from '../utils/web3wallet';
import { ConnectionBackButton } from './connection-back-button';

const chain = sepolia;

export function WalletConnection() {
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(window.location.search);
  const uri = searchParams.get('uri') ?? '';

  const web3wallet = useWeb3Wallet();

  const { activeAccount } = useAccountStorage();
  const { keys: addresses } = useOwnerKeys(activeAccount?.identity ?? '');

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

  const approve = async () => {
    try {
      if (!sessionProposalId || !sessionProposal) return;

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
        error: EXTENSION_ERROR.WC_SESSION_NOT_FOUND,
      });
    }
  };

  const reject = async () => {
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

      await web3wallet?.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result: `${activeAccountL1Address}-${activeAccount?.identity}`,
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
    responseToSite({
      method: ETH_METHOD.REQUEST_ACCOUNTS,
      event: EXTENSION_EVENT.USER_CLOSED_POPUP,
    });
  }, []);

  const onClickApproveConnect = async () => {
    await approve();
  };

  const onClickRejectConnect = async () => {
    await reject();
    window.removeEventListener('beforeunload', onPopupClosed);
    await closePopup();
  };

  useEffect(() => {
    if (!web3wallet) {
      return;
    }

    const receivePairProposal = async () => {
      const activeSessions = web3wallet?.getActiveSessions();

      if (activeSessions && Object.values(activeSessions).length > 0) {
        const currentSession = Object.values(activeSessions)[0];
        await web3wallet?.disconnectSession({
          topic: currentSession?.topic as string,
          reason: getInternalError('RESTORE_WILL_OVERRIDE'),
        });
      }

      await web3wallet?.pair({ uri });
    };

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
              <PrimaryButton
                expand="block"
                onClick={onClickRejectConnect}
                disabled={!sessionProposalId}
              >
                {t('Deny')}
              </PrimaryButton>
            </IonCol>
            <IonCol size={'6'}>
              <PrimaryButton
                expand="block"
                onClick={onClickApproveConnect}
                disabled={!sessionProposalId}
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
