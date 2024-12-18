import { IonIcon } from '@ionic/react';
import type { MouseEventHandler } from 'react';

import { useAppSelector } from '../../../redux/app/hooks';
import { selectTheme } from '../../../redux/slices/preferenceSlice';
import { themeType } from '../../../theme/const';

export const CopyIcon = (props: {
  isGrey?: boolean;
  isDim?: boolean;
  size?: string;
  slot?: string;
  className?: string;
  style?: Record<string, string>;
  onClick?: MouseEventHandler;
}) => {
  const storedTheme = useAppSelector(selectTheme);

  //TODO: check why &[slot="icon-only"] does not work to get rid of this long "if"
  const lightModeIcon = props.isDim
    ? 'copy-icon-primary.svg'
    : 'copy-icon-primary-10.svg';
  const darkModeIcon = props.isDim
    ? 'copy-icon-primary-70.svg'
    : 'copy-icon-white.svg';

  return (
    <IonIcon
      className="icon-button-icon"
      src={`/shared-assets/images/${
        props.isGrey
          ? 'copy-icon-grey.svg'
          : storedTheme === themeType.DARK
            ? darkModeIcon
            : lightModeIcon
      }`}
      {...props}
    />
  );
};
