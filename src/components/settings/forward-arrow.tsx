import { IonIcon } from '@ionic/react';
import { caretForwardOutline } from 'ionicons/icons';
export function ForwardArrow() {
  return (
    <IonIcon
      style={{
        width: '12px',
        height: '12px',
      }}
      className="ion-no-margin"
      slot="end"
      size="small"
      color="var(--ion-color-primary-shade)"
      src={caretForwardOutline}
    />
  );
}
