import { IonHeader, IonImg } from '@ionic/react';

import { useAppSelector } from '../redux/app/hooks';
import { selectTheme } from '../redux/slices/preferenceSlice';
import { themeType } from '../theme/const';

export function PopupHeader() {
  const storedTheme = useAppSelector(selectTheme);

  const logoName =
    storedTheme === themeType.DARK
      ? 'wallet-logo-dark.svg'
      : 'wallet-logo-light.svg';

  return (
    <IonHeader
      className="ion-no-border"
      style={{
        background: 'var(--ion-header-background)',
        justifyContent: 'center',
        display: 'flex',
      }}
    >
      <div>
        <IonImg
          alt={''}
          src={`/shared-assets/images/${logoName}`}
          style={{ height: '100%' }}
        />
      </div>
    </IonHeader>
  );
}
