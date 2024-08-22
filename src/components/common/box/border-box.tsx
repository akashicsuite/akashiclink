import styled from '@emotion/styled';
import { IonItem } from '@ionic/react';

export const BorderedBox = styled(IonItem)<{ compact?: boolean }>(
  ({ compact }) => ({
    '--min-height': 'auto',
    ['&::part(native)']: {
      color: 'var(--ion-color-primary)',
      '--border-color': '#7b757f',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 8,
      fontSize: '0.75rem',
      '--inner-padding-end': '8px',
      marginInlineStart: 0,
      height: compact ? 32 : 'auto',
    },
    p: {
      textWrap: 'wrap',
      width: '100%',
    },
  })
);
