import styled from '@emotion/styled';
import { IonSpinner } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import type { GridComponents } from 'react-virtuoso';
import { Virtuoso } from 'react-virtuoso';

import { OneActivity } from '../../components/activity/one-activity';
import { WhiteButton } from '../../components/common/buttons';
import { Divider } from '../../components/common/divider';
import { AlertIcon } from '../../components/common/icons/alert-icon';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { urls } from '../../constants/urls';
import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import type { LocationState } from '../../routing/history';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { themeType } from '../../theme/const';
import { formatMergeAndSortNftAndCryptoTransfers } from '../../utils/formatTransfers';
import { useMyTransfersInfinite } from '../../utils/hooks/useMyTransfersInfinite';
import { useNftTransfersMe } from '../../utils/hooks/useNftTransfersMe';

const ListContainer = styled.div({
  paddingLeft: '8px',
  paddingRight: '8px',
}) as GridComponents['List'];

export const NoActivityWrapper = styled.div({
  width: '100%',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  marginTop: '200px',
});
export const NoActivityText = styled.div({
  fontFamily: 'Nunito Sans',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '24px',
  color: 'var(--ion-color-primary-10)',
});
export const TableWrapper = styled.div({
  fontSize: '10px',
  padding: '0px 8px',
  color: '#B0A9B3',
});
export const ColumnWrapper = styled.div({
  fontWeight: '700',
});

export const TableHeads = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
});

const ListFooter: GridComponents['Footer'] = ({
  context: { loadMore, loading },
}) => {
  const { t } = useTranslation();

  return (
    <div className={'ion-display-flex ion-justify-content-center'}>
      <WhiteButton
        expand="block"
        size={'small'}
        disabled={loading}
        onClick={loadMore}
        style={{
          minWidth: 200,
        }}
      >
        {loading ? t('Loading') : t('LoadMore')}
      </WhiteButton>
    </div>
  );
};

export function Activity() {
  const { t } = useTranslation();
  const history = useHistory<LocationState>();
  const storedTheme = useAppSelector(selectTheme);
  const {
    transfers,
    transactionCount,
    isLoading,
    isLoadingMore,
    setSize,
    size,
  } = useMyTransfersInfinite();
  const { transfers: nftTransfers, isLoading: isLoadingNft } =
    useNftTransfersMe();

  const formattedTransfers = formatMergeAndSortNftAndCryptoTransfers(
    transfers,
    nftTransfers
  );

  const loadMore = () => {
    setSize(size + 1);
  };

  const isDataLoaded = !isLoading && !isLoadingNft;

  return (
    <DashboardLayout showSwitchAccountBar showAddress showRefresh>
      <TableWrapper>
        <TableHeads>
          <div className="ion-margin-left-xs ion-display-flex ion-gap-lg">
            <ColumnWrapper>{t('State')}</ColumnWrapper>
            <ColumnWrapper>{t('TransactionType')}</ColumnWrapper>
          </div>
          <ColumnWrapper className="ion-margin-right-xs">
            {t('Amount/NFT')}
          </ColumnWrapper>
        </TableHeads>
        <Divider
          className="ion-margin-right-xs ion-margin-left-xs ion-margin-top-xs"
          borderColor={storedTheme === themeType.DARK ? '#2F2F2F' : '#D9D9D9'}
          height={'1px'}
          borderWidth={'0.5px'}
        />
      </TableWrapper>
      {!isDataLoaded && (
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
      )}
      {isDataLoaded && formattedTransfers.length === 0 && (
        <NoActivityWrapper>
          <AlertIcon />
          <NoActivityText>{t('NoActivity')}</NoActivityText>
        </NoActivityWrapper>
      )}
      {isDataLoaded && formattedTransfers.length !== 0 && (
        <Virtuoso
          style={{
            margin: '8px 0px',
            minHeight: 'calc(100vh - 200px - var(--ion-safe-area-bottom)',
          }}
          data={formattedTransfers}
          context={{ loading: isLoadingMore, loadMore }}
          components={{
            List: ListContainer,
            Footer:
              transactionCount && transfers.length < transactionCount
                ? ListFooter
                : undefined,
          }}
          /* TODO should extract a standalone component here as the linter suggests */
          itemContent={(index, transfer) => (
            <OneActivity
              transfer={transfer}
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
              showDetail
              hasHoverEffect
              divider={index !== formattedTransfers.length - 1}
            />
          )}
        />
      )}
    </DashboardLayout>
  );
}
