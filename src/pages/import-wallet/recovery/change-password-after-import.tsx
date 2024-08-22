import styled from '@emotion/styled';
import { IonCol, IonIcon, IonRow } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import {
  PrimaryButton,
  SquareWhiteButton,
} from '../../../components/common/buttons';
import { StyledInput } from '../../../components/common/input/styled-input';
import { MainGrid } from '../../../components/layout/main-grid';
import { PublicLayout } from '../../../components/page-layout/public-layout';
import { urls } from '../../../constants/urls';
import { akashicPayPath } from '../../../routing/navigation-tabs';

const StyledSpan = styled.span({
  fontSize: '12px',
  fontWeight: '400',
  color: 'var(--ion-color-primary-10)',
  marginTop: '4px',
  lineHeight: '16px',
});

export function ChangePasswordAfterImport() {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <PublicLayout contentStyle={{ padding: '0 48px' }}>
      <SquareWhiteButton
        className="icon-button"
        style={{ position: 'fixed', left: '24px', marginTop: '16px' }}
        onClick={() => {
          history.push(akashicPayPath(urls.importWalletSuccessful));
        }}
      >
        <IonIcon
          className="icon-button-icon"
          slot="icon-only"
          icon={arrowBack}
        />
      </SquareWhiteButton>
      <MainGrid style={{ gap: '24px', padding: '72px 0px' }}>
        <IonRow>
          <IonCol>
            <h2 style={{ marginBottom: '4px' }}>{t('ChangePassword')}</h2>
            <StyledSpan>{t('ChangePasswordInfo')}</StyledSpan>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <StyledInput
              label={'New Password'}
              type={'password'}
              placeholder={t('EnterYourNewPassword')}
            />
          </IonCol>
          <IonCol size="12">
            <StyledInput
              label={t('ConfirmPassword')}
              type={'password'}
              placeholder={t('ConfirmYourPassword')}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <PrimaryButton expand="block">{t('Confirm')}</PrimaryButton>
          </IonCol>
        </IonRow>
      </MainGrid>
    </PublicLayout>
  );
}
