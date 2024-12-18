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
      ? 'wallet-logo-dark.svg'
      : 'wallet-logo-light.svg';

  return (
    <IonHeader
      className="ion-no-border"
      style={{
        background: 'var(--ion-header-background)',
        display: 'flex',
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
        <SettingSelect />
      </div>
    </IonHeader>
  );
}
