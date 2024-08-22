import styled from '@emotion/styled';
import type { INft } from '@helium-pay/backend';
import { IonCol, IonGrid, IonRow, IonSpinner } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import type { GridComponents } from 'react-virtuoso';
import { Virtuoso } from 'react-virtuoso';

import { AlertIcon } from '../../components/common/icons/alert-icon';
import { OneNft } from '../../components/nft/one-nft';
import { NftLayout } from '../../components/page-layout/nft-layout';
import { urls } from '../../constants/urls';
import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { themeType } from '../../theme/const';
import { useNftMe } from '../../utils/hooks/useNftMe';

export const NoNtfWrapper = styled(IonCol)({
  top: '20%',
  position: 'relative',
});

const StyledNftWrapper = styled.div({
  height: '408px',
  width: '328px',
  margin: '16px 8px',
  ['&:last-child']: {
    marginBottom: '40px',
  },
});

export const NoNtfText = styled(IonRow)({
  fontFamily: 'Nunito Sans',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '24px',
  color: 'var(--ion-color-primary-10)',
});

const ListContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  alignContent: 'center',
  position: 'absolute',
  justifyContent: 'space-evenly',
  width: '100%',
}) as GridComponents['List'];

export function Nfts() {
  const { t } = useTranslation();
  const storedTheme = useAppSelector(selectTheme);
  const isDarkMode = storedTheme === themeType.DARK;
  const history = useHistory();
  const { nfts, isLoading } = useNftMe();
  const sortedNfts = nfts.sort((a, b) => {
    if (a.acns?.value && !b.acns?.value) return -1;
    if (!a.acns?.value && b.acns?.value) return 1;
    return 0;
  });

  const selectNft = (nft: INft) => {
    history.push({
      pathname: akashicPayPath(urls.nft),
      state: {
        nft: {
          nftName: nft.name,
        },
      },
    });
  };

  return (
    <NftLayout>
      {isLoading && <IonSpinner name="circular"></IonSpinner>}
      {!isLoading && nfts.length === 0 && (
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol className="ion-center">
              <div>
                <AlertIcon />
                <NoNtfText>{t('DoNotOwnNfts')}</NoNtfText>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      )}
      {!isLoading && nfts.length > 0 && (
        <Virtuoso
          style={{
            minHeight: 'calc(100vh - 100px - var(--ion-safe-area-bottom)',
            width: '100%',
          }}
          overscan={900}
          totalCount={nfts.length}
          data={sortedNfts}
          components={{
            Item: StyledNftWrapper,
            List: ListContainer,
          }}
          itemContent={(_index, nft) => (
            <OneNft
              isBig={true}
              nft={nft}
              select={() => selectNft(nft)}
              isAASDarkStyle={!isDarkMode}
            />
          )}
        ></Virtuoso>
      )}
    </NftLayout>
  );
}
