import { IonIcon } from '@ionic/react';
import { moon, sunny } from 'ionicons/icons';

import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { selectTheme, setTheme } from '../../../redux/slices/preferenceSlice';
import { themeType } from '../../../theme/const';
import { Toggle } from '../../common/toggle/toggle';

export function ThemeSelect() {
  const dispatch = useAppDispatch();
  const storedTheme = useAppSelector(selectTheme);

  const handleThemeUpdate = async () => {
    const newTheme =
      storedTheme === themeType.LIGHT ? themeType.DARK : themeType.LIGHT;

    dispatch(setTheme(newTheme));
  };

  // Shorthand for setting css props of the slider
  const isDarkMode = storedTheme === themeType.DARK;

  return (
    <Toggle
      onClickHandler={handleThemeUpdate}
      currentState={isDarkMode ? 'active' : 'inActive'}
      containerStyle={{ alignSelf: 'base-line' }}
      sliderStyle={{
        backgroundColor: 'var(--toggle-theme-background)',
      }}
      switchStyle={{ width: '60px' }}
      firstIcon={
        <IonIcon
          style={{ left: '1px', color: 'var(--toggle-theme-text)' }}
          icon={sunny}
        />
      }
      secondIcon={
        <IonIcon
          style={{ right: '1px', color: 'var(--toggle-theme-text)' }}
          icon={moon}
        />
      }
    />
  );
}
