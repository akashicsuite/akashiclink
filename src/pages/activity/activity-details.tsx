import styled from '@emotion/styled';
import { IonImg } from '@ionic/react';
import { t } from 'i18next';
import { useHistory } from 'react-router-dom';

import { TransactionLayer } from '../../../../backend';
import { NftDetail } from '../../components/activity/nft-details';
import { TransactionDetails } from '../../components/activity/transactions-details';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import type { LocationState } from '../../routing/history';

type CoinInfo = {
  [key: string]: {
    background: string;
    icon: string;
  };
};
const chainBackgroundMap: CoinInfo = {
  BTC: {
    background: '#EB0029',
    icon: 'trx_icon.png',
  },
  TBTC: {
    background: '#EB0029',
    icon: 'trx_icon.png',
  },
  TRX: {
    background: '#EB0029',
    icon: 'trx_icon.png',
  },
  'TRX-NIL': {
    background: '#EB0029',
    icon: 'trx_icon.png',
  },
  'TRX-SHASTA': {
    background: '#EB0029',
    icon: 'trx_icon.png',
  },
  ETH: {
    background: '#290056',
    icon: 'eth_icon.png',
  },
  SEP: {
    background: '#290056',
    icon: 'eth_icon.png',
  },
  BNB: {
    background: '#290056',
    icon: 'eth_icon.png',
  },
  tBNB: {
    background: '#290056',
    icon: 'eth_icon.png',
  },
  AKASHIC: {
    background: 'transparent',
    icon: 'akashic-details-icon.svg',
  },
};

const IconBackground = styled.div((props: { backgroundColor: string }) => ({
  backgroundColor: props.backgroundColor,
  height: '18px',
  width: '18px',
  borderRadius: '100%',
  padding: '4px',
  position: 'relative',
}));

const ActivityContainer = styled.div({
  position: 'relative',
  margin: '0 auto',
  padding: '4px 24px',
});
export const ActivityDetails = () => {
  const history = useHistory<LocationState>();
  const transfer = history.location.state?.activityDetails?.currentTransfer;
  if (!transfer) {
    return <></>;
  }
  const chainName =
    transfer.layer === TransactionLayer.L2
      ? t('Chain.AkashicChain')
      : t(`Chain.${transfer.currency?.chain.toUpperCase()}`);
  const chain: { icon: string; background: string } =
    transfer.layer === TransactionLayer.L2
      ? chainBackgroundMap['AKASHIC']
      : chainBackgroundMap[
          transfer.currency?.chain?.toUpperCase() || 'AKASHIC'
        ];

  return (
    <DashboardLayout showSwitchAccountBar showAddress showRefresh>
      <ActivityContainer>
        {transfer.nft ? (
          <NftDetail currentTransfer={transfer} />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <h2>{t('TransactionDetails')}</h2>
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <IconBackground backgroundColor={chain.background}>
                    <IonImg
                      alt=""
                      src={`/shared-assets/icons/${chain.icon}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                    />
                  </IconBackground>
                  <span
                    className="ion-text-size-xs"
                    style={{ color: '#958E99' }}
                  >
                    {chainName}
                  </span>
                </div>
              </div>
            </div>
            <TransactionDetails currentTransfer={transfer} />
          </>
        )}
      </ActivityContainer>
    </DashboardLayout>
  );
};
