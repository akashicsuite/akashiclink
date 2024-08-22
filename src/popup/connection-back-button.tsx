import styled from '@emotion/styled';
import { IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { useLogout } from '../utils/hooks/useLogout';

const BackButton = styled(IonButton)({
  marginLeft: -8,
  height: 32,
  '--padding-start': '8px',
  '--padding-end': 0,
  ['p']: {
    paddingLeft: 8,
  },
});

export const ConnectionBackButton = () => {
  const { t } = useTranslation();
  const logout = useLogout();

  const onClickBackButton = () => {
    logout();
  };

  return (
    <BackButton size="small" fill="clear" onClick={onClickBackButton}>
      <IonIcon
        slot="icon-only"
        src={`/shared-assets/images/arrow_back_ios_new.svg`}
      />
      <p className={'ion-text-bold ion-text-capitalize'}>
        {t('LockAndUnlockAnotherAccount')}
      </p>
    </BackButton>
  );
};
