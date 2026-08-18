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
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { closeOutline } from 'ionicons/icons';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type I18nKeys } from '../../../i18n/I18nNamespaces';
import { PrimaryButton } from '../buttons';

/**
 * @param success for green, red otherwise
 * @param visible if true
 * @param message to display in menu
 */
export interface FormAlertState {
  success: boolean;
  visible: boolean;
  message: I18nKeys | null;
  messageProps?: Record<string, unknown>;
  subtitle?: I18nKeys;
  subtitleProps?: Record<string, unknown>;
}

export const errorAlertShell = (
  message: I18nKeys,
  messageProps?: Record<string, unknown>
) => ({
  success: false,
  visible: true,
  message,
  messageProps,
});

export const successAlertShell = (
  message: I18nKeys,
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
  message: null,
};

export interface CustomAlertState {
  visible: boolean;
  success: boolean;
  message: I18nKeys | null;
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
      message={state.message ?? ''}
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
export function CustomAlert({
  state,
  onDidDismiss,
}: {
  state: CustomAlertState;
  onDidDismiss?: () => void;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(state.visible);

  /**
   * Respond to changes in the externally supplied state
   */
  useEffect(() => setIsOpen(state.visible), [state]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={() => {
        setIsOpen(false);
        onDidDismiss?.();
      }}
      className="custom-alert"
    >
      <IonToolbar color="#ffffff">
        <IonButtons slot="end">
          <IonButton
            data-testid={'custom-alert-close-button'}
            onClick={() => setIsOpen(false)}
          >
            <IonIcon
              className="icon-button-icon"
              slot="icon-only"
              icon={closeOutline}
            />
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <div className="warning">
        <ErrorOutlineIcon
          style={{
            width: '48px',
            height: '48px',
            color: 'var(--ion-color-danger)',
          }}
        />
        <IonText className="warning-text">
          <h2>{state.success ? `${t('Success')}` : `${t('Failure')}`}</h2>
          {t(state.message ?? '', state.messageProps)}
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
  customStyle,
  icon,
  iconOverride,
  onDismiss,
}: {
  state: FormAlertState;
  style?: React.CSSProperties;
  customStyle?: {
    container?: React.CSSProperties;
    text?: React.CSSProperties;
    icon?: React.CSSProperties;
  };
  icon?: string;
  iconOverride?: ReactNode;
  onDismiss?: () => void;
}) {
  const { t } = useTranslation();
  const color = state.success
    ? 'var(--ion-color-success)'
    : 'var(--ion-color-danger)';

  // Use custom styles if provided, otherwise fall back to default styles
  const containerStyle = customStyle?.container ?? {
    ...(state.visible && {
      border: `1px solid ${style?.color ?? color}`,
      justifyContent: 'left',
      padding: '0 5%',
    }),
  };

  const textStyle = customStyle?.text ?? {
    marginTop: '5px',
    marginBottom: '5px',
    color,
    ...style,
  };

  const iconStyle = customStyle?.icon ?? {
    color,
  };

  const defaultIconStyle = {
    width: '24px',
    height: '24px',
    flexShrink: 0,
    marginRight: '8px',
    ...iconStyle,
  };

  const defaultIcon = icon ? (
    <IonIcon icon={icon} style={defaultIconStyle} />
  ) : (
    <ErrorOutlineIcon style={defaultIconStyle} />
  );

  return (
    <IonNote className="alert-box" style={containerStyle}>
      {iconOverride ?? defaultIcon}
      {state.subtitle ? (
        <div>
          <h4 style={{ ...textStyle, fontWeight: 700 }}>
            {t(state.message ?? '', state.messageProps)}
          </h4>
          <h4 style={{ ...textStyle, fontWeight: 400 }}>
            {t(state.subtitle, state.subtitleProps)}
          </h4>
        </div>
      ) : (
        <h4 style={textStyle}>{t(state.message ?? '', state.messageProps)}</h4>
      )}
      {onDismiss && (
        <CloseIcon
          onClick={onDismiss}
          style={{
            width: '20px',
            height: '20px',
            flexShrink: 0,
            marginLeft: 'auto',
            cursor: 'pointer',
            color: 'var(--ion-color-step-400)',
          }}
        />
      )}
    </IonNote>
  );
}
