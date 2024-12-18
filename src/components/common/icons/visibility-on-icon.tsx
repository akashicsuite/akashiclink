import { IonIcon } from '@ionic/react';
import type { MouseEventHandler } from 'react';

import { useAppSelector } from '../../../redux/app/hooks';
import { selectTheme } from '../../../redux/slices/preferenceSlice';
import { themeType } from '../../../theme/const';

export const VisibilityOnIcon = (props: {
  isGrey?: boolean;
  isDim?: boolean;
  size?: string;
  slot?: string;
  className?: string;
  style?: Record<string, string>;
  onClick?: MouseEventHandler;
}) => {
  const storedTheme = useAppSelector(selectTheme);

  return (
    <IonIcon
      className="icon-button-icon"
      src={`/shared-assets/images/${
        props.isGrey
          ? 'visibility-on-grey.svg'
          : storedTheme === themeType.DARK
            ? 'visibility-on-primary-70.svg'
            : 'visibility-on-primary.svg'
      }`}
      {...props}
    />
  );
};
