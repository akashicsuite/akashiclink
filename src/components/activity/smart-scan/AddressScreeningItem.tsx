import styled from '@emotion/styled';
import { IonImg, IonText } from '@ionic/react';
import { type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_CURRENCIES_FOR_EXTENSION } from '../../../constants/currencies';
import { type SmartScanType } from '../../../pages/address-screening/AddressScreeningHistoryList';
import { formatDate } from '../../../utils/formatDate';
import { Divider } from '../../common/divider';

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
  scan: SmartScanType;
  onClick?: () => void;
  style?: CSSProperties;
  showDetail?: boolean;
  hasHoverEffect?: boolean;
  divider?: boolean;
}

const currenciesIcon = [...SUPPORTED_CURRENCIES_FOR_EXTENSION.list];

export function AddressScreeningItem({
  scan,
  onClick,
  style,
  hasHoverEffect,
  divider,
}: AddressScreeningItemProps) {
  const { t } = useTranslation();

  const currencyObj = currenciesIcon.find(
    (c) => c.walletCurrency.chain === scan.currency?.chain
  );

  return (
    <>
      <AddressScreeningWrapper
        key={scan.hash}
        onClick={onClick}
        style={style}
        hover={hasHoverEffect || false}
      >
        <IconWrapper>
          <TypeIcon>
            <IonImg
              alt=""
              src={currencyObj?.currencyIcon}
              style={{
                height: '32px',
                width: '32px',
              }}
            />
          </TypeIcon>
          <FlexWrapper>
            <AccountHash className="ion-text-size-xxs">{scan.hash}</AccountHash>
            <Time className="ion-text-size-xxs">
              {formatDate(new Date(scan.date))}
            </Time>
          </FlexWrapper>
        </IconWrapper>
        <IonText
          className="ion-text-size-xs"
          style={{
            color: RISK_COLORS[scan.risk.toLowerCase()],
            fontWeight: 700,
          }}
        >
          {t(scan.risk)}
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
