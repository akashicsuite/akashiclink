import { IonHeader, IonImg, IonRouterLink } from '@ionic/react';

import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import { SettingModalWithTriggerButton } from '../settings/setting-modal-with-trigger-button';
import { LanguageDropdown } from './toolbar/language-select';

export function PublicHeader() {
  const storedTheme = useAppSelector(selectTheme);
  const logoName =
    storedTheme === themeType.DARK
      ? 'wallet-logo-dark-public-header.svg'
      : 'wallet-logo-light-public-header.svg';

  return (
    <IonHeader
      className="ion-no-border"
      style={{
        background: 'var(--ion-background-color)',
        display: 'flex', // overwrite ionic default ion-header
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
      <SettingModalWithTriggerButton />
    </IonHeader>
  );
}
