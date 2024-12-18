import styled from '@emotion/styled';
import {
  IonCol,
  IonGrid,
  IonImg,
  IonRow,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../../components/common/buttons';
import { CopyBox } from '../../components/common/copy-box';
import { LayoutWithActivityTab } from '../../components/page-layout/layout-with-activity-tab';
import {
  ALLOWED_NETWORKS,
  SUPPORTED_CURRENCIES_FOR_EXTENSION,
} from '../../constants/currencies';
import { useAppSelector } from '../../redux/app/hooks';
import {
  selectFocusCurrency,
  selectTheme,
} from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useOwnerKeys } from '../../utils/hooks/useOwnerKeys';
import { createL1Address } from '../../utils/wallet-creation';

const CoinWrapper = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0',
  gap: '8px',
});

const QRCodeWrapper = styled.div({
  lineHeight: 0,
  padding: 8,
  backgroundColor: 'var(--ion-color-white)',
  borderRadius: 8,
  margin: 4,
  width: 96,
  height: 96,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export function DepositPage() {
  const { t } = useTranslation();
  const storedTheme = useAppSelector(selectTheme);
  const { activeAccount, cacheOtk } = useAccountStorage();

  const [isGeneratingAddress, setIsGeneratingAddress] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState<string | undefined>(
    undefined
  );

  const currency = useAppSelector(selectFocusCurrency);
  const currentWalletMetadata =
    SUPPORTED_CURRENCIES_FOR_EXTENSION.lookup(currency);

  const {
    keys: addresses,
    isLoading: isAddressesLoading,
    mutate,
  } = useOwnerKeys(activeAccount?.identity ?? '');
  const walletAddressDetail = addresses?.find(
    (address) =>
      address.coinSymbol.toLowerCase() ===
      currentWalletMetadata.walletCurrency.chain.toLowerCase()
  );

  const existingAddress = walletAddressDetail?.address;

  const isCoinAllowed = ALLOWED_NETWORKS.includes(
    currentWalletMetadata.walletCurrency.chain
  );

  const hasAddress = !!generatedAddress || !!existingAddress;

  const handleGetAddress = () => {
    const createAddress = async () => {
      try {
        // Attempt to create missing l1 address
        if (!existingAddress && cacheOtk && !isGeneratingAddress) {
          setIsGeneratingAddress(true);
          const generatedAddress = await createL1Address(
            cacheOtk,
            currentWalletMetadata.walletCurrency.chain
          );
          await mutate();
          setGeneratedAddress(generatedAddress);
        }
      } catch (e) {
        console.warn(e as Error);
      } finally {
        setIsGeneratingAddress(false);
      }
    };
    if (!isGeneratingAddress) {
      createAddress();
    }
  };

  return (
    <LayoutWithActivityTab showRefresh={false} loading={isAddressesLoading}>
      <IonGrid className="ion-padding-top-xs ion-padding-bottom-xs ion-padding-left-md ion-padding-right-md">
        <IonRow class="ion-justify-content-center ion-grid-row-gap-xxs">
          <IonCol class="ion-center" size="12">
            <CoinWrapper>
              {walletAddressDetail?.coinSymbol && (
                <IonImg
                  alt={''}
                  src={
                    storedTheme === themeType.DARK
                      ? currentWalletMetadata.darkCurrencyIcon
                      : currentWalletMetadata.currencyIcon
                  }
                  style={{ height: '32px', width: '32px' }}
                />
              )}
              <IonText>
                <h3 className="ion-no-margin">
                  {currentWalletMetadata.walletCurrency.displayName ?? '-'}
                </h3>
              </IonText>
            </CoinWrapper>
          </IonCol>
          <IonCol class={'ion-center'} size="12">
            <QRCodeWrapper>
              {isGeneratingAddress && (
                <IonSpinner color="primary" name="circular" />
              )}
              {!isGeneratingAddress && !hasAddress && (
                <IonImg
                  alt=""
                  src={`/shared-assets/images/${
                    isCoinAllowed ? 'Pending' : 'Failed'
                  }-white.svg`}
                />
              )}
              {!isGeneratingAddress && hasAddress && (
                <QRCodeSVG
                  value={generatedAddress ?? existingAddress ?? ''}
                  size={80}
                />
              )}
            </QRCodeWrapper>
          </IonCol>
          <IonCol size="10">
            {hasAddress && (
              <CopyBox
                label={t('PublicAddress')}
                text={generatedAddress ?? existingAddress ?? '-'}
              />
            )}
            {!hasAddress && isCoinAllowed && (
              <PrimaryButton
                expand="block"
                onClick={handleGetAddress}
                isLoading={isGeneratingAddress}
              >
                {t('ClickToGenerateAddress')}
              </PrimaryButton>
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    </LayoutWithActivityTab>
  );
}
