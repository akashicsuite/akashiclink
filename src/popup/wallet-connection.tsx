import { PersonalSignMessage } from '@akashic/as-backend';
import { IonCol, IonRow } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BorderedBox } from '../components/common/box/border-box';
import { OutlineButton, PrimaryButton } from '../components/common/buttons';
import { AccountListItem } from '../components/manage-account/account-list-item';
import { PopupLayout } from '../components/page-layout/popup-layout';
import { useAppSelector } from '../redux/app/hooks';
import { selectTheme } from '../redux/slices/preferenceSlice';
import { BRIDGE_MESSAGE } from '../types/bridge-types';
import type { IRequestAccountsReturnType } from '../types/provider-types';
import { responseErrorToSite, responseToSite } from '../utils/chrome';
import { useAccountStorage } from '../utils/hooks/useLocalAccounts';
import { useSetGlobalLanguage } from '../utils/hooks/useSetGlobalLanguage';
import { useSignMessage } from '../utils/hooks/useSignMessage';
import { ConnectionBackButton } from './connection-back-button';

type RequestAccountsPopupData = {
  signInRequest?: {
    message: string;
    expires: number;
  };
};

export function WalletConnection() {
  const { t } = useTranslation();
  const [id, setId] = useState<number>();
  const [popupData, setPopupData] = useState<RequestAccountsPopupData>();

  useEffect(() => {
    const url = new URL(window.location.href);
    const idParam = url.searchParams.get('id');
    const dataParam = url.searchParams.get('data');
    if (idParam) setId(Number(idParam));
    if (dataParam) {
      try {
        setPopupData(JSON.parse(decodeURIComponent(dataParam)));
      } catch {
        setPopupData(undefined);
      }
    }
  }, []);

  // retrieve user AL setting
  const storedTheme = useAppSelector(selectTheme);
  const [globalLanguage] = useSetGlobalLanguage();

  const { activeAccount, cacheOtk } = useAccountStorage();
  const signMessage = useSignMessage();
  const signInMessage = popupData?.signInRequest?.message;

  const [isProcessing, setIsProcessing] = useState(false);

  const onClickApproveConnect = async () => {
    try {
      setIsProcessing(true);
      if (!activeAccount?.identity || !cacheOtk?.key.pub.pkcs8pem) {
        throw new Error('No active account or cache OTK found');
      }

      const result: IRequestAccountsReturnType = {
        accounts: [
          {
            identity: activeAccount.identity,
            publicKey: cacheOtk.key.pub.pkcs8pem,
          },
        ],
        userData: {
          walletPreference: {
            theme: storedTheme,
            language: globalLanguage.replace('-', '='), // use replace for backward compatible with "-"
          },
        },
      };
      const signInRequest = popupData?.signInRequest;
      if (
        signInRequest?.message === PersonalSignMessage.SIGN_IN_AKASHIC_PAY ||
        signInRequest?.message === PersonalSignMessage.SIGN_IN_BM
      ) {
        result.signInSignature = signMessage({
          message: signInRequest.message,
          identity: activeAccount.identity,
          expires: signInRequest.expires,
        });
      }

      await responseToSite(BRIDGE_MESSAGE.APPROVAL_DECISION, id, true, result);
    } catch (e) {
      await responseErrorToSite(
        e instanceof Error ? e.message : JSON.stringify(e),
        id
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const onClickRejectConnect = async () => {
    setIsProcessing(true);
    await responseToSite(BRIDGE_MESSAGE.APPROVAL_DECISION, id, false);
    setIsProcessing(false);
  };

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
              {signInMessage && (
                <p className="ion-justify-content-center ion-margin-top-md ion-margin-bottom-0">
                  {signInMessage}
                </p>
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
                disabled={isProcessing}
              >
                {t('Deny')}
              </OutlineButton>
            </IonCol>
            <IonCol size={'6'}>
              <PrimaryButton
                expand="block"
                onClick={onClickApproveConnect}
                isLoading={isProcessing}
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
