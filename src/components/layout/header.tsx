import { IonHeader, IonImg } from '@ionic/react';

import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import { SettingSelect } from '../settings/setting-select';
import { HistoryBackButton } from './toolbar/history-back-button';

export function Header() {
  const storedTheme = useAppSelector(selectTheme);

  const logoName =
    storedTheme === themeType.DARK
      ? 'wallet-logo-light.svg'
      : 'wallet-logo-dark.svg';

  return (
    <IonHeader
      className="ion-no-border"
      style={{
        background: 'var(--ion-header-background)',
      }}
    >
      <HistoryBackButton />
      <div>
        <IonImg
          alt={''}
          src={`/shared-assets/images/${logoName}`}
          style={{ height: '100%' }}
        />
      </div>
      <div
        style={{
          height: 40,
          width: 40,
        }}
      >
        <SettingSelect loggedIn />
      </div>
    </IonHeader>
  );
}
