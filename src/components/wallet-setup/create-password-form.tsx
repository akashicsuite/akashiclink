import { userConst } from '@helium-pay/backend';
import { IonCheckbox, IonCol, IonRow } from '@ionic/react';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../redux/app/hooks';
import type { CreateWalletForm } from '../../redux/slices/createWalletSlice';
import type { ImportWalletForm } from '../../redux/slices/importWalletSlice';
import { useIosScrollPasswordKeyboardIntoView } from '../../utils/hooks/useIosScrollPasswordKeyboardIntoView';
import type { FormAlertState } from '../common/alert/alert';
import { AlertBox } from '../common/alert/alert';
import { PrimaryButton, WhiteButton } from '../common/buttons';
import {
  StyledInput,
  StyledInputErrorPrompt,
} from '../common/input/styled-input';
import { MainGrid } from '../layout/main-grid';
import { PublicLayout } from '../page-layout/public-layout';

export function CreatePasswordForm({
  form,
  onInputChange,
  onCancel,
  onSubmit,
  alert,
  isLoading = false,
}: {
  form: CreateWalletForm;
  onInputChange:
    | ActionCreatorWithPayload<
        ImportWalletForm,
        'importWalletSlice/onInputChange'
      >
    | ActionCreatorWithPayload<
        CreateWalletForm,
        'createWalletSlice/onInputChange'
      >;
  onCancel: () => void;
  onSubmit: () => void;
  alert?: FormAlertState;
  isLoading?: boolean;
}) {
  useIosScrollPasswordKeyboardIntoView();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [passwordsMatched, setPasswordsMatched] = useState(true);

  // Validate password format
  const validatePassword = (value: string) =>
    !!RegExp(userConst.passwordRegex).exec(value);

  // Check if passwords match
  const validatePasswordsMatch = (
    password?: string,
    confirmPassword?: string
  ) => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  };

  // Update passwords match state whenever either password changes
  useEffect(() => {
    setPasswordsMatched(
      validatePasswordsMatch(form.password, form.confirmPassword)
    );
  }, [form.password, form.confirmPassword]);

  return (
    <PublicLayout className="vertical-center">
      <MainGrid className="ion-grid-row-gap-sm">
        <IonRow>
          <IonCol size="12">
            <h2 className={'ion-margin-bottom-xxs'}>{t('CreatePassword')}</h2>
            <p
              className={'ion-margin-0 ion-text-align-center ion-text-size-xs'}
            >
              {t('CreatePasswordInfo')}
            </p>
          </IonCol>
          <IonRow className="w-100 ion-grid-row-gap-xs">
            <IonCol size="12">
              <StyledInput
                label={t('NewPassword')}
                placeholder={t('EnterPassword')}
                type="password"
                onIonInput={({ detail: { value } }) => {
                  dispatch(
                    onInputChange({
                      password: String(value),
                    })
                  );
                }}
                value={form.password}
                errorPrompt={StyledInputErrorPrompt.Password}
                validate={validatePassword}
              />
            </IonCol>
            <IonCol size="12">
              <StyledInput
                label={t('ConfirmPassword')}
                type="password"
                placeholder={t('ConfirmPassword')}
                onIonInput={({ detail: { value } }) => {
                  dispatch(
                    onInputChange({
                      confirmPassword: String(value),
                    })
                  );
                }}
                value={form.confirmPassword}
                errorPrompt={StyledInputErrorPrompt.ConfirmPassword}
                isValid={passwordsMatched}
                submitOnEnter={onSubmit}
              />
            </IonCol>
          </IonRow>
          <IonCol size="12" className={'ion-center'}>
            <IonCheckbox
              checked={form.checked}
              labelPlacement={'end'}
              onIonChange={() => {
                dispatch(
                  onInputChange({
                    checked: !form.checked,
                  })
                );
              }}
            >
              {t('CreatePasswordAgree')}
            </IonCheckbox>
          </IonCol>
          {alert?.visible && (
            <IonCol size="12">
              <AlertBox state={alert} />
            </IonCol>
          )}
          <IonCol size="6">
            <PrimaryButton
              expand="block"
              onClick={onSubmit}
              disabled={
                isLoading ||
                !form.password ||
                !form.confirmPassword ||
                !form.checked ||
                !passwordsMatched ||
                !validatePassword(form.password)
              }
              isLoading={isLoading}
            >
              {t('Confirm')}
            </PrimaryButton>
          </IonCol>
          <IonCol size="6">
            <WhiteButton
              disabled={isLoading}
              expand="block"
              fill="clear"
              onClick={onCancel}
            >
              {t('GoBack')}
            </WhiteButton>
          </IonCol>
        </IonRow>
      </MainGrid>
    </PublicLayout>
  );
}
