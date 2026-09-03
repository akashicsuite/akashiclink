import { type CryptoCurrencyWithName } from '@akashic/as-backend';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { arrowDownOutline, arrowForwardOutline } from 'ionicons/icons';
import {
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../constants/urls';
import { historyResetStackAndRedirect } from '../../routing/history';
import { useIsScopeAccessAllowed } from '../../utils/account';
import { formatAmountWithCommas } from '../../utils/formatAmountWithCommas';
import { useAccountL1Address } from '../../utils/hooks/useAccountL1Address';
import { useCryptoCurrencyBalance } from '../../utils/hooks/useCryptoCurrencyBalance';
import { useFetchAndRemapL1Address } from '../../utils/hooks/useFetchAndRemapL1address';
import { useFiatCurrencyDisplay } from '../../utils/hooks/useFiatCurrencyDisplay';
import TransactionHistoryList from '../activity/transaction-history-list';
import { PrimaryButton, WhiteButton } from '../common/buttons';
import { CryptoCurrencyIcon } from '../common/chain-icon/crypto-currency-icon';
import { CopyBox } from '../common/copy-box';
import { GenerateL1AddressButton } from '../deposit/generate-l1-address-button';
import { SendFormContext } from '../send/send-modal-context-provider';

export function DashboardCryptoCurrencyDetail({
  setIsModalOpen,
  setStep,
  walletCurrency,
}: {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<number>>;
  walletCurrency: CryptoCurrencyWithName;
}) {
  const { t } = useTranslation();
  const isSendAllowed = useIsScopeAccessAllowed('send');
  const isDepositAllowed = useIsScopeAccessAllowed('deposit');
  const fetchAndRemapL1Address = useFetchAndRemapL1Address();

  const { address } = useAccountL1Address(walletCurrency.coinSymbol);

  const { balance, balanceInFiat } = useCryptoCurrencyBalance(
    walletCurrency.coinSymbol,
    walletCurrency.tokenSymbol
  );

  const { fiatCurrencySign } = useFiatCurrencyDisplay();

  const {
    setIsModalOpen: setIsSendModalOpen,
    setCurrency,
    setStep: setSendModalStep,
  } = useContext(SendFormContext);

  const handleOnClickDeposit = () => {
    setStep(1);
  };

  const handleOnClickSend = () => {
    setCurrency(walletCurrency);
    setSendModalStep(1);
    setIsSendModalOpen(true);
    setIsModalOpen(false);
  };

  const handleOnClickTxnHistoryItem = () => {
    historyResetStackAndRedirect(urls.activity);
    setIsModalOpen(false);
  };

  const onGeneratedNewAddress = () => {
    fetchAndRemapL1Address();
  };

  useEffect(() => {
    fetchAndRemapL1Address();
  }, []);

  return (
    <IonGrid>
      <IonRow className={'ion-grid-row-gap-xxs'}>
        <IonCol size={'12'} className={'ion-text-align-center'}>
          <CryptoCurrencyIcon
            size={60}
            coinSymbol={walletCurrency.coinSymbol}
            tokenSymbol={walletCurrency.tokenSymbol}
          />
        </IonCol>
        <IonCol size={'12'}>
          <IonText>
            <p className="ion-text-size-xl ion-text-bold ion-text-align-center">
              {`${formatAmountWithCommas(balance ?? '0', 2)} ${walletCurrency.displayName}`}
            </p>
          </IonText>
        </IonCol>
        <IonCol size={'12'}>
          <IonText>
            <p className="ion-text-size-sm ion-text-color-grey ion-text-align-center">
              {`~${fiatCurrencySign}${balanceInFiat ? formatAmountWithCommas(balanceInFiat.toString(), 2) : '-'}`}
            </p>
          </IonText>
        </IonCol>
        {address && (
          <>
            {isDepositAllowed && (
              <IonCol size={'10'} offset={'1'}>
                <CopyBox label={t('DepositAddress')} text={address ?? '-'} />
              </IonCol>
            )}
            <IonCol size={'5'} offset={'1'}>
              <PrimaryButton
                disabled={!isSendAllowed}
                expand="block"
                onClick={handleOnClickSend}
              >
                {t('Send')}
                <IonIcon slot="end" icon={arrowForwardOutline} />
              </PrimaryButton>
            </IonCol>
            <IonCol size={'5'}>
              <WhiteButton
                disabled={!isDepositAllowed}
                expand="block"
                onClick={handleOnClickDeposit}
              >
                {t('Deposit')}
                <IonIcon slot="end" icon={arrowDownOutline}></IonIcon>
              </WhiteButton>
            </IonCol>
          </>
        )}
        {isDepositAllowed && !address && (
          <IonCol size={'8'} offset={'2'} className={'ion-text-align-center'}>
            <GenerateL1AddressButton
              chain={walletCurrency.coinSymbol}
              onGeneratedAddress={onGeneratedNewAddress}
            />
          </IonCol>
        )}

        <IonCol size={'12'}>
          <TransactionHistoryList
            isFilterType
            isFilterNFT
            minHeight={'calc(80vh - 312px - var(--ion-safe-area-bottom))'}
            currency={walletCurrency}
            onClick={handleOnClickTxnHistoryItem}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
