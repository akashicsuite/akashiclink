import './deposit-page.scss';

import styled from '@emotion/styled';
import { IonCol, IonGrid, IonImg, IonRow, IonText } from '@ionic/react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

import { CopyBox } from '../../components/common/copy-box';
import { LayoutWithActivityTab } from '../../components/page-layout/layout-with-activity-tab';
import { SUPPORTED_CURRENCIES_FOR_EXTENSION } from '../../constants/currencies';
import { useAppSelector } from '../../redux/app/hooks';
import {
  selectFocusCurrency,
  selectTheme,
} from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useOwnerKeys } from '../../utils/hooks/useOwnerKeys';

const CoinWrapper = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0',
  gap: '8px',
});

const QRCodeWrapper = styled.div({
  border: '1px solid var(--ion-color-white)',
  lineHeight: 0,
  padding: 8,
  backgroundColor: 'var(--ion-color-white)',
  borderRadius: 8,
  margin: '4px 0',
});

export function DepositPage() {
  const { t } = useTranslation();
  const storedTheme = useAppSelector(selectTheme);
  const currency = useAppSelector(selectFocusCurrency);
  const { activeAccount } = useAccountStorage();
  // Find specified currency or default to the first one
  const currentWalletMetadata =
    SUPPORTED_CURRENCIES_FOR_EXTENSION.lookup(currency);

  const { keys: addresses, isLoading: isAddressesLoading } = useOwnerKeys(
    activeAccount?.identity ?? ''
  );
  const walletAddressDetail = addresses?.find(
    (address) =>
      address.coinSymbol.toLowerCase() ===
      currentWalletMetadata.walletCurrency.chain.toLowerCase()
  );
  const walletAddress = walletAddressDetail?.address ?? '-';

  // TODO: this redirection is still buggy (very strange) need to take good look at how routing works
  // if (!isAddressesLoading && walletAddressDetail === undefined) {
  //   return <Redirect to={akashicPayPath(urls.error)} />;
  // }

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
              <QRCodeSVG value={walletAddress} size={80} />
            </QRCodeWrapper>
          </IonCol>
          <IonCol size="10">
            <CopyBox label={t('PublicAddress')} text={walletAddress} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </LayoutWithActivityTab>
  );
}
