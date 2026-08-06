import type { IWalletScreeningObject } from '@akashic/as-backend';
import styled from '@emotion/styled';
import { IonText } from '@ionic/react';
import { type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../constants/urls';
import { historyGo } from '../../routing/history';
import { formatDate } from '../../utils/formatDate';
import { CryptoCurrencyIcon } from '../common/chain-icon/crypto-currency-icon';
import { Divider } from '../common/divider';

const AddressScreeningWrapper = styled.div<{ hover: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  '&:hover': {
    background: props.hover ? 'rgba(103, 80, 164, 0.14)' : 'transparent',
  },
  cursor: 'pointer',
  ['&:active, &:focus, &:hover']: {
    background: 'rgba(89, 89, 146, 0.08)',
  },
}));

const IconWrapper = styled.div({
  display: 'flex',
  gap: '8px',
});

const FlexWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
});

const TypeIcon = styled.div({
  position: 'relative',
  display: 'inline-block',
});

const Time = styled.div({
  fontWeight: 400,
  color: 'var(--ion-neutral-70)',
});

const AccountHash = styled.div({
  fontWeight: 700,
});

const RISK_COLORS: { [key: string]: string } = {
  severe: 'var(--risk-level-severe-text)',
  high: 'var(--risk-level-high-text)',
  moderate: 'var(--risk-level-moderate-text)',
  low: 'var(--risk-level-low-text)',
};

/**
 * Display of a single transfer
 * @param any for the backend
 * @param onClick callback
 * @param style addition to apply to the bounding vox
 * @param showDetail arrow, inviting user to click and see full transfer information
 * @param divider separator after
 */
interface AddressScreeningItemProps {
  screening: IWalletScreeningObject;
  style?: CSSProperties;
  showDetail?: boolean;
  hasHoverEffect?: boolean;
  divider?: boolean;
}

export function AddressScreeningHistoryItem({
  screening,
  style,
  hasHoverEffect,
  divider,
}: AddressScreeningItemProps) {
  const { t } = useTranslation();

  const handleClick = () => {
    historyGo(urls.addressScreeningDetails, {
      addressScreeningSearch: {
        id: screening.paymentL2Hash,
      },
    });
  };

  return (
    <>
      <AddressScreeningWrapper
        key={screening.paymentL2Hash ?? ''}
        onClick={handleClick}
        style={style}
        hover={hasHoverEffect || false}
      >
        <IconWrapper>
          <TypeIcon>
            <CryptoCurrencyIcon coinSymbol={screening.coinSymbol} size={32} />
          </TypeIcon>
          <FlexWrapper>
            <AccountHash className="ion-text-size-xxs">
              {screening.address}
            </AccountHash>
            <Time className="ion-text-size-xxs">
              {formatDate(new Date(screening.createdAt))}
            </Time>
          </FlexWrapper>
        </IconWrapper>
        <IonText
          className="ion-text-size-xs"
          style={{
            color: RISK_COLORS[screening.riskLevel.toLowerCase()],
            fontWeight: 700,
          }}
        >
          {t(screening.riskLevel)}
        </IonText>
      </AddressScreeningWrapper>
      {divider && (
        <Divider
          className={'ion-margin-left-xs ion-margin-right-xs'}
          borderColor={'var(--activity-list-divider)'}
          height={'1px'}
          borderWidth={'0.5px'}
          style={{ marginInline: 0 }}
        />
      )}
    </>
  );
}
