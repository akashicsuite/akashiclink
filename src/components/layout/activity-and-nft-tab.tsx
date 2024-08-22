import styled from '@emotion/styled';
import { t } from 'i18next';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';

import { urls } from '../../constants/urls';
import type { LocationState } from '../../routing/history';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { formatMergeAndSortNftAndCryptoTransfers } from '../../utils/formatTransfers';
import { useMyTransfers } from '../../utils/hooks/useMyTransfers';
import { useNftTransfersMe } from '../../utils/hooks/useNftTransfersMe';
import { OneActivity } from '../activity/one-activity';
import { TabButton } from '../common/buttons';
import { Tabs } from './tabs';

const SeeMore = styled(Link)({
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '14px',
  lineHeight: '20px',
  color: '#958E99',
  textDecorationLine: 'underline',
  marginTop: '10px',
  '&:hover': {
    cursor: 'pointer',
  },
  textAlign: 'center',
  width: '100%',
  display: 'block',
  bottom: '2rem',
});

const NoDataDiv = styled.span({
  fontSize: '16px',
  fontFamily: 'Nunito Sans',
  fontWeight: '700',
  lineHeight: '24px',
  color: 'var(--ion-color-primary-10)',
  width: '100%',
  textAlign: 'center',
  position: 'absolute',
  top: '50%',
});

const NoDataWrapper = styled.div({
  height: '25vh',
  position: 'relative',
});

export const ActivityAndNftTabComponent = ({
  setNftTab,
  nftTab,
  fromNfts = false,
}: {
  setNftTab: Dispatch<SetStateAction<boolean>>;
  nftTab: boolean;
  fromNfts: boolean;
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <Tabs>
      <TabButton
        style={{ width: '50%', marginInline: '0' }}
        id="activity"
        className={!nftTab ? 'open' : ''}
        onClick={() =>
          !fromNfts
            ? setNftTab(false)
            : history.push(akashicPayPath(urls.activity))
        }
      >
        {t('Activity')}
      </TabButton>
      <TabButton
        style={{ width: '50%', marginInline: '0' }}
        id={'nft'}
        onClick={() => {
          if (!fromNfts) {
            history.push(akashicPayPath(urls.nfts));
          }
        }}
        className={nftTab ? 'open' : ''}
      >
        NFT
      </TabButton>
    </Tabs>
  );
};

export function ActivityAndNftTab() {
  const itemDisplayIndex = 3;
  const history = useHistory<LocationState>();
  const [nftTab, setNftTab] = useState(false);
  const { transfers } = useMyTransfers();
  const { transfers: nftTransfers } = useNftTransfersMe();
  const walletFormatTransfers = formatMergeAndSortNftAndCryptoTransfers(
    transfers,
    nftTransfers
  );
  return (
    <>
      <ActivityAndNftTabComponent
        nftTab={nftTab}
        setNftTab={setNftTab}
        fromNfts={false}
      />
      <div
        className="vertical"
        style={{ padding: '0px 16px', paddingTop: '24px' }}
      >
        {!nftTab &&
          walletFormatTransfers
            .slice(0, itemDisplayIndex - 1)
            .map((transfer, index) => {
              return (
                <OneActivity
                  key={transfer.id}
                  transfer={transfer}
                  divider={index + 1 !== itemDisplayIndex - 1}
                  showDetail={true}
                  onClick={() => {
                    history.push({
                      pathname: akashicPayPath(urls.activityDetails),
                      state: {
                        activityDetails: {
                          currentTransfer: transfer,
                        },
                      },
                    });
                  }}
                />
              );
            })}
        {walletFormatTransfers.length >= itemDisplayIndex && !nftTab && (
          <SeeMore
            style={{ marginTop: '8px' }}
            to={akashicPayPath(urls.activity)}
          >
            {t('SeeMore')}
          </SeeMore>
        )}
        {!walletFormatTransfers.length && (
          <NoDataWrapper>
            <NoDataDiv>{t('NoActivity')}</NoDataDiv>
          </NoDataWrapper>
        )}
      </div>
    </>
  );
}
