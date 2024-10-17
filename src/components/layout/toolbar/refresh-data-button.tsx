import { IonIcon } from '@ionic/react';
import { useState } from 'react';

import { REFRESH_BUTTON_DISABLED_TIME } from '../../../constants';
import { useAppSelector } from '../../../redux/app/hooks';
import { selectTheme } from '../../../redux/slices/preferenceSlice';
import { themeType } from '../../../theme/const';
import { useAccountMe } from '../../../utils/hooks/useAccountMe';
import { useMyTransfersInfinite } from '../../../utils/hooks/useMyTransfersInfinite';
import { useNftMe } from '../../../utils/hooks/useNftMe';
import { useNftTransfersMe } from '../../../utils/hooks/useNftTransfersMe';
import { SquareWhiteButton } from '../../common/buttons';

export const RefreshDataButton = () => {
  const { mutateMyTransfers } = useMyTransfersInfinite();
  const { mutateNftTransfersMe } = useNftTransfersMe();
  const { mutate: mutateAccountMe } = useAccountMe();
  const { mutateNftMe } = useNftMe();

  const storedTheme = useAppSelector(selectTheme);
  const [refreshDisabled, setRefreshDisabled] = useState(false);

  return (
    <SquareWhiteButton
      disabled={refreshDisabled}
      className="icon-button"
      id="refresh-button"
      onClick={async () => {
        try {
          setRefreshDisabled(true);
          await mutateMyTransfers();
          await mutateNftTransfersMe();
          await mutateAccountMe();
          await mutateNftMe();
        } finally {
          // To prevent spam of the backend, disable the refresh button for a little while
          setTimeout(
            () => setRefreshDisabled(false),
            REFRESH_BUTTON_DISABLED_TIME
          );
        }
      }}
    >
      <IonIcon
        slot="icon-only"
        className="icon-button-icons"
        src={`/shared-assets/images/${
          storedTheme === themeType.DARK
            ? 'refresh-dark.svg'
            : 'refresh-light.svg'
        }`}
      />
    </SquareWhiteButton>
  );
};
