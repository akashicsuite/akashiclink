import styled from '@emotion/styled';
import type { JSX } from '@ionic/core/components';
import { IonIcon, IonImg, IonItem, IonLabel } from '@ionic/react';
import { removeCircle } from 'ionicons/icons';
import { useEffect, useState } from 'react';

import type { LocalAccount } from '../../utils/hooks/useLocalAccounts';
import { displayLongText } from '../../utils/long-text';
import { getNftImage } from '../../utils/nft-image-link';

const InitialIcon = styled.div<{ isActive: boolean; forceLightMode?: boolean }>(
  ({ isActive, forceLightMode }) => ({
    width: '32px',
    height: '32px',
    flex: '0 0 32px',
    borderRadius: '32px',
    background: forceLightMode
      ? 'var(--ion-popup-initial-icon-color)'
      : 'var(--ion-initial-icon-color)',
    margin: '0px',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'inline-flex',
    color: 'var(--ion-color-white)',
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
  })
);
const StyledNftImage = styled(IonImg)({
  height: '32px',
  width: '32px',
  minWidth: '32px',
  borderRadius: '32px',
  overflow: 'hidden',
});
const IconAndLabel = styled(IonItem)<{ forceLightMode?: boolean }>(
  ({ forceLightMode }) => ({
    '--padding-start': 0,
    ['ion-label']: {
      ['h3']: {
        marginBottom: 0,
        fontWeight: 700,
        ...(forceLightMode && { color: 'var(--ion-color-on-primary)' }),
      },
      ['p']: {
        fontSize: '0.625rem',
        lineHeight: '1rem',
        overflowWrap: 'anywhere',
        ...(forceLightMode && { color: 'var(--ion-color-grey)' }),
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
  forceLightMode = false,
  onClick,
  ...props
}: {
  account: LocalAccount;
  showDeleteIcon?: boolean;
  isShortAddress?: boolean;
  isActive?: boolean;
  forceLightMode?: boolean;
  onClick?: () => void;
} & JSX.IonItem) => {
  const [nftUrl, setNftUrl] = useState('');

  useEffect(() => {
    async function getNft() {
      if (account.ledgerId) {
        const nftUrl = await getNftImage(account.ledgerId, '32');
        setNftUrl(nftUrl);
      }
    }
    getNft();
  }, []);
  return (
    <IconAndLabel
      detail={false}
      onClick={onClick}
      key={account.identity}
      forceLightMode={forceLightMode}
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
          {account.ledgerId && <StyledNftImage src={nftUrl} />}
          {!account.ledgerId && (
            <InitialIcon isActive={isActive} forceLightMode={forceLightMode}>
              AS
            </InitialIcon>
          )}

          <IonLabel>
            <h3 className={'ion-text-align-left ion-margin-bottom-0'}>
              {account.alias ?? account.accountName}
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
