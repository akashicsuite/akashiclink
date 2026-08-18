import { IonIcon } from '@ionic/react';
import { closeOutline, warningOutline } from 'ionicons/icons';

import { AlertBox } from '../../common/alert/alert';

const CLOSE_ICON_GUTTER = '28px';

export const FirstTimeAddressWarning = ({
  floating = false,
  onDismiss,
}: {
  floating?: boolean;
  onDismiss: () => void;
}) => {
  return (
    <div
      style={
        floating
          ? {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }
          : { marginTop: 'auto', padding: '8px 0' }
      }
    >
      <div style={{ position: 'relative' }}>
        <AlertBox
          state={{
            success: false,
            visible: true,
            message: 'FirstTimeAddressWarning',
          }}
          customStyle={{
            container: {
              borderLeft: '8px solid var(--ion-color-primary)',
              borderTop: '1px solid var(--ion-color-primary)',
              borderRight: '1px solid var(--ion-color-primary)',
              borderBottom: '1px solid var(--ion-color-primary)',
              padding: `12px ${CLOSE_ICON_GUTTER} 12px 12px`,
              justifyContent: 'flex-start',
              gap: '8px',
              backgroundColor: 'var(--ion-background-color)',
            },
            text: {
              color: 'var(--ion-color-inverse-surface)',
              textAlign: 'left',
              margin: 0,
            },
          }}
          iconOverride={
            <IonIcon
              icon={warningOutline}
              style={{
                width: '18px',
                height: '18px',
                flexShrink: 0,
                color: 'var(--ion-color-primary)',
              }}
            />
          }
        />
        <IonIcon
          icon={closeOutline}
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            cursor: 'pointer',
            fontSize: '20px',
            color: 'var(--ion-color-outline)',
          }}
        />
      </div>
    </div>
  );
};
