import styled from '@emotion/styled';
import type { JSX } from '@ionic/core/components';
import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { removeCircle } from 'ionicons/icons';

import type { LocalAccount } from '../../utils/hooks/useLocalAccounts';
import { displayLongText } from '../../utils/long-text';

const InitialIcon = styled.div<{ isActive: boolean }>(({ isActive }) => ({
  width: '32px',
  height: '32px',
  flex: '0 0 32px',
  borderRadius: '32px',
  background: '#7444B6',
  margin: '0px',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'inline-flex',
  color: '#FFFFFF',
  fontSize: '12px',
  fontWeight: '700',
  position: 'relative',
  ['&::after']: isActive && {
    border: '1px solid var(--ion-background-color)',
    borderRadius: '50%',
    bottom: 0,
    right: 0,
    content: '""',
    position: 'absolute',
    background: 'var(--ion-color-success)',
    width: 8,
    height: 8,
  },
}));

const IconAndLabel = styled(IonItem)<{ isLightText?: boolean }>(
  ({ isLightText }) => ({
    ['ion-label']: {
      ['h3']: {
        marginBottom: 0,
        fontWeight: 700,
        ...(isLightText && { color: 'var(--ion-color-white)' }),
      },
      ['p']: {
        fontSize: '0.625rem',
        lineHeight: '1rem',
        overflowWrap: 'anywhere',
        ...(isLightText && { color: 'var(--ion-color-grey)' }),
      },
    },
    ['&:last-of-kind .item-inner']: {
      border: 0,
    },
    ['&::part(native)']: {
      background: 'transparent',
    },
  })
);

export const AccountListItem = ({
  account,
  showDeleteIcon = false,
  isShortAddress = false,
  isActive = false,
  isLightText = false,
  onClick,
  ...props
}: {
  account: LocalAccount;
  showDeleteIcon?: boolean;
  isShortAddress?: boolean;
  isActive?: boolean;
  isLightText?: boolean;
  onClick?: () => void;
} & JSX.IonItem) => {
  return (
    <IconAndLabel
      detail={false}
      onClick={onClick}
      key={account.identity}
      isLightText={isLightText}
      {...props}
    >
      <div
        className={'w-100 ion-margin-top ion-margin-bottom'}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <div
          className={'w-100 ion-align-items-center'}
          style={{ display: 'flex', flexDirection: 'row', gap: 8 }}
        >
          {showDeleteIcon && (
            <IonIcon
              style={{ fontSize: 32, color: 'var(--ion-color-failed)' }}
              icon={removeCircle}
            />
          )}
          <InitialIcon isActive={isActive}>AS</InitialIcon>
          <IonLabel>
            <h3 className={'ion-text-align-left ion-margin-bottom-0'}>
              {account.aasName ?? account.accountName}
            </h3>
            <p className={'ion-text-align-left ion-text-size-xxs'}>
              {isShortAddress
                ? displayLongText(account.identity, 16, false, true)
                : account.identity}
            </p>
          </IonLabel>
        </div>
      </div>
    </IconAndLabel>
  );
};
