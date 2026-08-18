import { IonIcon } from '@ionic/react';
import type { MouseEventHandler } from 'react';

import { useAppSelector } from '../../../redux/app/hooks';
import { selectTheme } from '../../../redux/slices/preferenceSlice';
import { themeType } from '../../../theme/const';

export const CopyIcon = ({
  isGrey,
  isDim,
  size = 16,
  slot,
  className,
  style,
  ...props
}: {
  isGrey?: boolean;
  isDim?: boolean;
  size?: number;
  slot?: string;
  className?: string;
  style?: Record<string, string>;
  onClick?: MouseEventHandler;
}) => {
  const storedTheme = useAppSelector(selectTheme);

  //TODO: check why &[slot="icon-only"] does not work to get rid of this long "if"
  const lightModeIcon = isDim
    ? 'copy-icon-primary.svg'
    : 'copy-icon-primary-10.svg';
  const darkModeIcon = isDim
    ? 'copy-icon-primary-70.svg'
    : 'copy-icon-white.svg';

  return (
    <IonIcon
      style={{
        fontSize: size,
        cursor: 'pointer',
        width: size,
        height: size,
        ...style,
      }}
      className={`icon-button-icon ${className ?? ''}`}
      src={`/assets/images/${
        isGrey
          ? 'copy-icon-grey.svg'
          : storedTheme === themeType.DARK
            ? darkModeIcon
            : lightModeIcon
      }`}
      {...props}
    />
  );
};
