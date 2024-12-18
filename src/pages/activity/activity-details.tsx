import styled from '@emotion/styled';
import { TransactionLayer } from '@helium-pay/backend';
import { t } from 'i18next';
import { useHistory } from 'react-router-dom';

import { NftDetail } from '../../components/activity/nft-details';
import { TransactionDetails } from '../../components/activity/transactions-details';
import { L2Icon } from '../../components/common/chain-icon/l2-icon';
import { NetworkIcon } from '../../components/common/chain-icon/network-icon';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import type { LocationState } from '../../routing/history';

export const ActivityContainer = styled.div({
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

  return (
    <DashboardLayout showSwitchAccountBar showAddress showRefresh>
      {transfer.nft ? (
        <NftDetail currentTransfer={transfer} />
      ) : (
        <ActivityContainer>
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
                {transfer.currency?.chain &&
                  (transfer.layer === TransactionLayer.L2 ? (
                    <L2Icon />
                  ) : (
                    <NetworkIcon chain={transfer.currency?.chain} />
                  ))}
                <span className="ion-text-size-xs" style={{ color: '#958E99' }}>
                  {chainName}
                </span>
              </div>
            </div>
          </div>
          <TransactionDetails currentTransfer={transfer} />
        </ActivityContainer>
      )}
    </DashboardLayout>
  );
};
