import styled from '@emotion/styled';
import { IonSpinner } from '@ionic/react';
import { t } from 'i18next';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';

import { urls } from '../../constants/urls';
import type { LocationState } from '../../routing/history';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { formatMergeAndSortNftAndCryptoTransfers } from '../../utils/formatTransfers';
import { useMyTransfersInfinite } from '../../utils/hooks/useMyTransfersInfinite';
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
  height: '136px',
  position: 'relative',
});

const ActivityAndNftTabs = ({
  openTab,
  setOpenTab,
}: {
  openTab: null | string;
  setOpenTab: Dispatch<SetStateAction<string>>;
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <Tabs data-testid={'activity-nft-tabs'}>
      <TabButton
        style={{ width: '50%', marginInline: '0' }}
        id="activity"
        className={openTab === 'activity' ? 'open' : ''}
        onClick={() =>
          openTab !== 'activity'
            ? setOpenTab('activity')
            : history.push(akashicPayPath(urls.activity))
        }
      >
        {t('Activity')}
      </TabButton>
      <TabButton
        style={{ width: '50%', marginInline: '0' }}
        id="nft"
        onClick={() => {
          openTab === 'nft'
            ? setOpenTab('nft')
            : history.push(akashicPayPath(urls.nfts));
        }}
        className={openTab === 'nft' ? 'open' : ''}
      >
        NFT
      </TabButton>
      <TabButton
        style={{ width: '50%', marginInline: '0' }}
        id="smart-scan"
        onClick={() => {
          setOpenTab('smart-scan');
          history.push(akashicPayPath(urls.addressScreening));
        }}
        className={openTab === 'smart-scan' ? 'open' : ''}
      >
        {t('SmartScan')}
      </TabButton>
    </Tabs>
  );
};

export function ActivityAndNftTab() {
  const itemDisplayLimit = 3;
  const history = useHistory<LocationState>();
  const [openTab, setOpenTab] = useState('activity');
  const { transfers, isLoading } = useMyTransfersInfinite();
  const { transfers: nftTransfers, isLoading: isLoadingNft } =
    useNftTransfersMe();

  const formattedTransfers = formatMergeAndSortNftAndCryptoTransfers(
    transfers,
    nftTransfers
  );

  const isActivityTabReady =
    openTab === 'activity' && !isLoading && !isLoadingNft;

  return (
    <>
      <ActivityAndNftTabs openTab={openTab} setOpenTab={setOpenTab} />
      <div className="vertical ion-padding-top-lg ion-padding-bottom-0 ion-padding-left-md ion-padding-right-md">
        {!isActivityTabReady && (
          <div
            className={
              'ion-display-flex ion-justify-content-center w-100 ion-margin-top-xl'
            }
          >
            <IonSpinner color="primary" name="circular" />
          </div>
        )}
        {isActivityTabReady &&
          formattedTransfers
            .slice(0, itemDisplayLimit - 1)
            .map((transfer, index) => {
              return (
                <OneActivity
                  key={transfer.id}
                  transfer={transfer}
                  divider={index + 1 !== itemDisplayLimit - 1}
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
        {isActivityTabReady &&
          formattedTransfers.length >= itemDisplayLimit && (
            <SeeMore
              className="ion-margin-top-xs"
              to={akashicPayPath(urls.activity)}
            >
              {t('SeeMore')}
            </SeeMore>
          )}
        {isActivityTabReady && formattedTransfers.length === 0 && (
          <NoDataWrapper>
            <NoDataDiv>{t('NoActivity')}</NoDataDiv>
          </NoDataWrapper>
        )}
      </div>
    </>
  );
}
