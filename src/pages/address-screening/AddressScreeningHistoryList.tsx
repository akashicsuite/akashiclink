import styled from '@emotion/styled';
import {
  EthereumSymbol,
  NetworkDictionary,
  TronSymbol,
} from '@helium-pay/backend';
import { IonIcon, IonText } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';

import { AddressScreeningItem } from '../../components/activity/smart-scan/AddressScreeningItem';
import { PrimaryButton } from '../../components/common/buttons';
import { Divider } from '../../components/common/divider';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { type IWalletCurrency } from '../../constants/currencies';

export const Wrapper = styled.div({
  display: 'flex',
  gap: '24px',
  flexDirection: 'column',
  padding: '0px 24px',
  backgroundColor: 'var(--ion-background)',
});

const SmartScanWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 16px',
});

const SmartScanFooter = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  paddingBlockStart: 25,
  gap: 8,
});

// TODO: swap with API data once it's ready
export type SmartScanType = {
  hash: string;
  date: Date;
  risk: string; // Could be made more specific with union type if risks are predetermined
  currency: IWalletCurrency;
};
const MOCK_SMART_SCANS: SmartScanType[] = [
  {
    hash: '0x47CE0C6eD5B0Ce3d3A51fd...c3c2936',
    date: new Date(),
    risk: 'Severe',
    currency: {
      chain: EthereumSymbol.Ethereum_Sepolia,
      displayName:
        NetworkDictionary[EthereumSymbol.Ethereum_Sepolia].nativeCoin
          .displayName,
    },
  },
  {
    hash: '0x47CE0C6eD5B0Ce3d3A51fd...c3c2936',
    date: new Date(),
    risk: 'High',
    currency: {
      chain: TronSymbol.Tron_Shasta,
      displayName:
        NetworkDictionary[TronSymbol.Tron_Shasta].nativeCoin.displayName,
    },
  },
  {
    hash: '0x47CE0C6eD5B0Ce3d3A51fd...c3c2936',
    date: new Date(),
    risk: 'Moderate',
    currency: {
      chain: EthereumSymbol.Ethereum_Sepolia,
      displayName: 'Ethereum Sepolia Testnet',
    },
  },
  {
    hash: '0x47CE0C6eD5B0Ce3d3A51fd...c3h2936',
    date: new Date(),
    risk: 'Low',
    currency: {
      chain: TronSymbol.Tron_Shasta,
      displayName:
        NetworkDictionary[TronSymbol.Tron_Shasta].nativeCoin.displayName,
    },
  },
  {
    hash: '0x47CE0C6eD5B0Ce3d3A51fd...c3t2936',
    date: new Date(),
    risk: 'Low',
    currency: {
      chain: TronSymbol.Tron_Shasta,
      displayName:
        NetworkDictionary[TronSymbol.Tron_Shasta].nativeCoin.displayName,
    },
  },
  {
    hash: '0x47CE0C6eD5B0Ce3d3A51fd...c3u2936',
    date: new Date(),
    risk: 'Low',
    currency: {
      chain: TronSymbol.Tron_Shasta,
      displayName:
        NetworkDictionary[TronSymbol.Tron_Shasta].nativeCoin.displayName,
    },
  },
  {
    hash: '0x47CE0C6eD5B0Ce3d3A51fd...c3d2936',
    date: new Date(),
    risk: 'Low',
    currency: {
      chain: TronSymbol.Tron_Shasta,
      displayName:
        NetworkDictionary[TronSymbol.Tron_Shasta].nativeCoin.displayName,
    },
  },
  {
    hash: '0x47CE0C6eD5B0Ce3d3A51fd...c3c2536',
    date: new Date(),
    risk: 'Low',
    currency: {
      chain: TronSymbol.Tron_Shasta,
      displayName:
        NetworkDictionary[TronSymbol.Tron_Shasta].nativeCoin.displayName,
    },
  },
];

const renderItem = (index: number, scan: SmartScanType) => (
  <AddressScreeningItem
    scan={scan}
    showDetail
    hasHoverEffect
    divider={index < MOCK_SMART_SCANS.length - 1}
  />
);

export const AddressScreeningHistoryList = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout showSwitchAccountBar showAddress showRefresh>
      <Wrapper>
        <IonText
          color="primary-10"
          className="ion-text-bold ion-padding-top-xs ion-padding-bottom-xs ion-text-align-center ion-text-size-xl"
        >
          {t('ViewHistory')}
        </IonText>
      </Wrapper>

      {/* TODO: adapt with API call */}
      {/* {!isDataLoaded && (
        <IonSpinner
          color="primary"
          name="circular"
          class="force-center"
          style={{
            marginLeft: '50vw',
            marginTop: '50%',
            transform: 'translateX(-50%)',
            '--webkit-transform': 'translateX(-50%)',
          }}
        />
      )} */}
      {/* TODO: adapt with API call */}
      {/* {isDataLoaded && MOCK_SMART_SCANS.length === 0 && (
        <NoActivityWrapper>
          <AlertIcon />
          <NoActivityText>{t('NoActivity')}</NoActivityText>
        </NoActivityWrapper>
      )} */}
      <SmartScanWrapper>
        <Virtuoso
          style={{
            margin: '8px 0px',
            minHeight: '240px',
          }}
          data={MOCK_SMART_SCANS}
          itemContent={renderItem}
        ></Virtuoso>
      </SmartScanWrapper>

      <SmartScanFooter>
        <Divider
          style={{ width: '328px', margin: 0 }}
          className={'ion-margin-left-xs ion-margin-right-xs'}
          borderColor={'var(--activity-list-divider)'}
          height={'1px'}
          borderWidth={'0.5px'}
        />
        <IonText
          style={{ fontWeight: 700 }}
          className="ion-text-size-xs text-center"
        >
          {t('ScanAddressReport')}
        </IonText>
        <PrimaryButton style={{ width: '150px', margin: 0 }}>
          <IonIcon icon={addOutline} />
          {t('NewScan')}
        </PrimaryButton>
      </SmartScanFooter>
    </DashboardLayout>
  );
};
