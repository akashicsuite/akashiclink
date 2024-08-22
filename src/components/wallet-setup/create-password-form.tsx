import { userConst } from '@helium-pay/backend';
import { IonCheckbox, IonCol, IonRow } from '@ionic/react';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
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

  /** Tracking user input */
  const validatePassword = (value: string) =>
    !!value.match(userConst.passwordRegex);
  const dispatch = useAppDispatch();
  const validateConfirmPassword = (value: string) => form.password === value;

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
                onIonInput={({ target: { value } }) =>
                  dispatch(
                    onInputChange({
                      password: String(value),
                    })
                  )
                }
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
                onIonInput={({ target: { value } }) =>
                  dispatch(
                    onInputChange({
                      confirmPassword: String(value),
                    })
                  )
                }
                value={form.confirmPassword}
                errorPrompt={StyledInputErrorPrompt.ConfirmPassword}
                validate={validateConfirmPassword}
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
                !form.password ||
                !form.confirmPassword ||
                !form.checked ||
                form.password !== form.confirmPassword
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
