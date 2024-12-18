import styled from '@emotion/styled';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import {
  CustomAlert,
  errorAlertShell,
  formAlertResetState,
} from '../../components/common/alert/alert';
import { PrimaryButton } from '../../components/common/buttons';
import { AasListingSwitch } from '../../components/nft/aas-listing-switch';
import { OneNft } from '../../components/nft/one-nft';
import { NftLayout } from '../../components/page-layout/nft-layout';
import { urls } from '../../constants/urls';
import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import type { LocationState } from '../../routing/history';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { themeType } from '../../theme/const';
import { useNftMe } from '../../utils/hooks/useNftMe';

export const NftWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  width: '100%',
  position: 'relative',
});

export const NftContainer = styled.div({
  position: 'relative',
  margin: '0 auto',
});

export function Nft() {
  const { t } = useTranslation();
  const history = useHistory<LocationState>();
  const state = history.location.state?.nft;
  const [alert, setAlert] = useState(formAlertResetState);
  const { nfts } = useNftMe();
  const currentNft = nfts.find((nft) => nft.name === state?.nftName);
  const storedTheme = useAppSelector(selectTheme);
  const isDarkMode = storedTheme === themeType.DARK;

  const [isLinked, setIsLinked] = useState(!!currentNft?.aas.linked);

  const transferNft = () => {
    if (currentNft?.aas?.linked) {
      setAlert(
        errorAlertShell('NSRecordWarning', { nftName: currentNft?.name || '' })
      );
      return;
    }
    history.push({
      pathname: akashicPayPath(urls.nftTransfer),
      state: history.location.state,
    });
  };

  return (
    <NftLayout>
      <div
        style={{
          backgroundColor: 'var(--nft-header-background)',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '160px',
        }}
      />

      <CustomAlert state={alert} />
      <NftWrapper>
        <IonGrid fixed={true}>
          <IonRow>
            {currentNft && (
              <NftContainer>
                <OneNft
                  nft={currentNft}
                  isBig={true}
                  isAASDarkStyle={!isDarkMode}
                  nftImgWrapper="nft-wrapper-one"
                  isLinked={isLinked}
                />
              </NftContainer>
            )}
          </IonRow>
          <IonRow className="ion-margin-top-xs ion-margin-bottom-xxs">
            <IonCol size="10" offset="1">
              <PrimaryButton
                style={{ width: '254px' }}
                expand="block"
                onClick={transferNft}
              >
                {t('Transfer')}
              </PrimaryButton>
            </IonCol>
          </IonRow>

          {currentNft && (
            <AasListingSwitch
              nft={currentNft}
              setAlert={setAlert}
              setParentLinkage={setIsLinked}
            />
          )}
        </IonGrid>
      </NftWrapper>
    </NftLayout>
  );
}
