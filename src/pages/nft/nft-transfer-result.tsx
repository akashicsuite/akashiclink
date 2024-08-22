import styled from '@emotion/styled';
import { IonCol, IonGrid, IonRow, isPlatform } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { PrimaryButton } from '../../components/common/buttons';
import { Divider } from '../../components/common/divider';
import { ErrorIconWithTitle } from '../../components/common/state-icon-with-title/error-icon-with-title';
import { SuccessfulIconWithTitle } from '../../components/common/state-icon-with-title/successful-icon-with-title';
import { NftLayout } from '../../components/page-layout/nft-layout';
import { errorMsgs } from '../../constants/error-messages';
import { urls } from '../../constants/urls';
import {
  type LocationState,
  historyGo,
  historyResetStackAndRedirect,
} from '../../routing/history';
import { useNftTransfersMe } from '../../utils/hooks/useNftTransfersMe';
import { displayLongText } from '../../utils/long-text';

// TODO: refactor all these with List
export const ResultContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '8px',
  width: '100%',
});

export const TextWrapper = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0px',
  minHeight: '24px',
  width: '100%',
});

export const TextTitle = styled.div({
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: '20px',
  color: 'var(--ion-color-primary-10)',
  display: 'flex',
  flexDirection: 'column',
});

export const TextContent = styled.div({
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: '24px',
  color: 'var(--ion-color-primary-10)',
});

// TODO: should use ITransferNftResponse instead
export interface TransferResultType {
  sender: string | null | undefined;
  receiver: string;
  nftName: string;
  acnsAlias: string;
  txHash?: string;
}

export function NftTransferResult() {
  const { t } = useTranslation();
  const { mutateNftTransfersMe } = useNftTransfersMe();
  const history = useHistory<LocationState>();
  const state = history.location.state?.nftTransferResult;
  const wrongResult = state?.errorMsg !== errorMsgs.NoError;
  const isMobile = isPlatform('mobile');

  const onFinish = async () => {
    // Push to dashboard ad then nfts to re-create the path taken to get to
    // nfts. This allows backbutton from nfts -> dashboard to work
    // Notate that mutate must be after history otherwise this page re-renders
    // with a persistent error
    await historyResetStackAndRedirect(urls.dashboard);
    await historyGo(urls.nfts);
    await mutateNftTransfersMe();
  };

  return (
    <NftLayout noFooter={true}>
      <IonGrid className={'ion-grid-gap-sm'} style={{ padding: '8px 16px' }}>
        <IonRow style={{ marginTop: !isMobile ? '6rem' : '3rem' }}>
          <IonCol size={'12'} className={'ion-center'}>
            {wrongResult ? (
              <ErrorIconWithTitle title={state?.errorMsg ?? ''} />
            ) : (
              <SuccessfulIconWithTitle title={t('TransactionSuccessful')} />
            )}
          </IonCol>
        </IonRow>
        <Divider style={{ width: '100%' }} />
        {wrongResult ? null : (
          <IonRow>
            <IonCol class="ion-center">
              <ResultContent>
                <TextWrapper>
                  <TextTitle>{t('txHash')}</TextTitle>
                  <TextContent>
                    {displayLongText(state?.transaction?.txHash ?? '')}
                  </TextContent>
                </TextWrapper>
                <TextWrapper>
                  <TextTitle>{t('Sender')}</TextTitle>
                  <TextContent>
                    {displayLongText(state?.transaction?.sender ?? '')}
                  </TextContent>
                </TextWrapper>
                <TextWrapper>
                  <TextTitle>{t('Receiver')}</TextTitle>
                  <TextContent>
                    {displayLongText(state?.transaction?.receiver ?? '')}
                  </TextContent>
                </TextWrapper>
                <TextWrapper>
                  <TextTitle>{'NFT'}</TextTitle>
                  <TextContent>{state?.transaction?.acnsAlias}</TextContent>
                </TextWrapper>
              </ResultContent>
            </IonCol>
          </IonRow>
        )}
        <IonRow className="ion-center">
          <IonCol size={'6'}>
            <PrimaryButton expand="block" onClick={onFinish}>
              {t('Ok')}
            </PrimaryButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </NftLayout>
  );
}
