import './alert.scss';

import {
  IonAlert,
  IonButton,
  IonButtons,
  IonIcon,
  IonModal,
  IonNote,
  IonText,
  IonToolbar,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../buttons';

/**
 * @param success for green, red otherwise
 * @param visible if true
 * @param message to display in menu
 */
export interface FormAlertState {
  success: boolean;
  visible: boolean;
  message: string;
  messageProps?: Record<string, unknown>;
}

export const errorAlertShell = (
  message: string,
  messageProps?: Record<string, unknown>
) => ({
  success: false,
  visible: true,
  message,
  messageProps,
});

export const successAlertShell = (
  message: string,
  messageProps?: Record<string, unknown>
) => ({
  success: true,
  visible: true,
  message,
  messageProps,
});

export const formAlertResetState: FormAlertState = {
  success: false,
  visible: false,
  message: '',
};

export interface CustomAlertState {
  visible: boolean;
  success: boolean;
  message: string;
  messageProps?: Record<string, unknown>;
  onConfirm?: () => void;
  confirmButtonMessage?: string;
}

/**
 * Popup alert featuring
 * - title
 * - message
 * - visibility state
 */
export function Alert({ state: externalState }: { state: FormAlertState }) {
  const { t } = useTranslation();
  const [state, setState] = useState(externalState);

  /**
   * Respond to changes in the externally supplied state
   */
  useEffect(() => setState(externalState), [externalState]);

  /** Monitors key presses to dismiss alert on ENTER */
  const handleKeyPress = (event: KeyboardEvent) =>
    event.key === 'Enter' && setState(formAlertResetState);
  return (
    <IonAlert
      isOpen={state.visible}
      header={state.success ? `${t('Success')}` : `${t('Failure')}`}
      message={state.message}
      buttons={['OK']}
      /* Listen for keydown events once rendered - stop once closed */
      onDidPresent={() => {
        document.addEventListener('keydown', handleKeyPress);
      }}
      onDidDismiss={() => {
        document.removeEventListener('keydown', handleKeyPress);
        setState(formAlertResetState);
      }}
    />
  );
}

/**
 * Popup alert with custom design featuring
 * - title
 * - message
 * - visibility state
 * - Optional button (e.g. to redirect somewhere)
 */
export function CustomAlert({ state }: { state: CustomAlertState }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(state.visible);

  /**
   * Respond to changes in the externally supplied state
   */
  useEffect(() => setIsOpen(state.visible), [state]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={() => setIsOpen(false)}
      className="custom-alert"
    >
      <IonToolbar color="#ffffff">
        <IonButtons slot="end">
          <IonButton onClick={() => setIsOpen(false)}>
            <IonIcon
              className="icon-button-icon"
              slot="icon-only"
              icon={closeOutline}
            />
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <div className="warning">
        <IonIcon
          src={'/shared-assets/images/error-outline.svg'}
          style={{ width: '48px', height: '48px' }}
        />
        <IonText className="warning-text">
          <h2>{state.success ? `${t('Success')}` : `${t('Failure')}`}</h2>
          {t(state.message, state.messageProps)}
        </IonText>
        {state.onConfirm && (
          <PrimaryButton onClick={state.onConfirm} style={{ width: '160px' }}>
            {state.confirmButtonMessage ?? t('Confirm')}
          </PrimaryButton>
        )}
      </div>
    </IonModal>
  );
}

/**
 * Boxed Alert featuring
 * - message
 * - visibility state
 */
export function AlertBox({
  state,
  style,
}: {
  state: FormAlertState;
  style?: React.CSSProperties;
}) {
  const { t } = useTranslation();
  const color = state.success
    ? 'var(--ion-color-success)'
    : 'var(--ion-color-danger)';

  return (
    <IonNote
      className="alert-box"
      style={{
        ...(state.visible && {
          border: `1px solid ${style?.color || color}`,
        }),
      }}
    >
      <h4
        style={{
          marginTop: '5px',
          marginBottom: '5px',
          color,
          ...style,
        }}
      >
        {t(state.message, state.messageProps)}
      </h4>
    </IonNote>
  );
}
