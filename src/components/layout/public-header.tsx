import { IonHeader, IonImg, IonRouterLink } from '@ionic/react';

import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import { SettingSelect } from '../settings/setting-select';
import { LanguageDropdown } from './toolbar/language-select';

export function PublicHeader() {
  const storedTheme = useAppSelector(selectTheme);
  const logoName =
    storedTheme === themeType.DARK
      ? 'wallet-logo-dark.svg'
      : 'wallet-logo-light.svg';

  return (
    <IonHeader
      className="ion-no-border"
      style={{
        background: 'var(--ion-background-color)',
      }}
    >
      <LanguageDropdown />
      <IonRouterLink>
        <IonImg
          alt={''}
          src={`/shared-assets/images/${logoName}`}
          style={{ height: '100%' }}
        />
      </IonRouterLink>
      <SettingSelect loggedIn={false} />
    </IonHeader>
  );
}
