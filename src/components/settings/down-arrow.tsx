import { IonIcon } from '@ionic/react';
import { caretDownOutline } from 'ionicons/icons';
export function DownArrow() {
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
      src={caretDownOutline}
    />
  );
}
