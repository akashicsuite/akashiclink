import styled from '@emotion/styled';
import { IonItem, IonLabel, IonText } from '@ionic/react';
import { type ReactNode } from 'react';

const AddressItem = styled(IonItem)({
  ['&::part(native)']: {
    '--background': 'transparent',
    '--padding-start': '0',
    '--padding-end': '0',
    '--inner-padding-end': '0',
    cursor: 'pointer',
    minHeight: '48px',
  },
});

const AddressInfo = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

export const PrimaryText = styled(IonText)({
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'var(--ion-text-color-alt)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const SecondaryText = styled(IonText)({
  fontSize: '0.75rem',
  color: 'var(--ion-text-color-alt)',
  marginTop: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/** Muted secondary line for de-emphasised addresses (e.g. under a nickname). */
export const MutedText = styled(IonText)({
  fontSize: '0.75rem',
  color: 'var(--ion-color-on-surface-light)',
  marginTop: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const AddressListItem = ({
  onSelect,
  children,
  trailing,
}: {
  onSelect: () => void;
  children: ReactNode;
  trailing?: ReactNode;
}) => (
  <AddressItem onClick={onSelect} button detail={false}>
    <IonLabel>
      <AddressInfo>{children}</AddressInfo>
    </IonLabel>
    {trailing ? <div slot="end">{trailing}</div> : null}
  </AddressItem>
);
