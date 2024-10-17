import './activity.scss';

import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';

import { ActivityContainer } from '../../pages/activity/activity-details';
import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import type { ITransactionRecordForExtension } from '../../utils/formatTransfers';
import { OneNft } from '../nft/one-nft';
import { BaseDetails } from './base-details';

const StyledNftWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  margin: 'auto',
  padding: '0',
  ['&:last-child']: {
    marginBottom: '40px',
  },
});

export function NftDetail({
  currentTransfer,
}: {
  currentTransfer: ITransactionRecordForExtension;
}) {
  const { t } = useTranslation();
  const storedTheme = useAppSelector(selectTheme);

  const isDarkMode = storedTheme === themeType.DARK;

  if (!currentTransfer.nft) return null;
  return (
    <>
      <StyledNftWrapper>
        <OneNft
          nft={currentTransfer.nft}
          isBig={true}
          isAASDarkStyle={!isDarkMode}
          nftImgWrapper="nft-wrapper-transfer"
          screen="transfer"
        />
      </StyledNftWrapper>

      <ActivityContainer>
        <h2 style={{ marginTop: '24px' }}>{t('TransactionDetails')}</h2>
        <BaseDetails currentTransfer={currentTransfer} />
      </ActivityContainer>
    </>
  );
}
