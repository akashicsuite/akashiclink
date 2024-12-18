import './styled-input.scss';

import { IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type Translation from '../../../i18n/translation/en_US.json';

/**
 * Useful prompts to display to user for invalid input.
 * The prompt MUST exist in the Translation files in ../i18n/Translation/en_US.json
 */
export const StyledInputErrorPrompt: {
  [key: string]: keyof typeof Translation;
} = {
  Password: 'PasswordHelpText',
  ConfirmPassword: 'ConfirmPasswordHelpText',
  Email: 'EmailHelpText',
  Amount: 'AmountHelpText',
  Address: 'AddressHelpText',
  ActivationCode: 'ActivationCodeText',
} as const;

type StyledInputProps = ComponentProps<typeof IonInput> & {
  /** label to show next to the input box */
  label?: string | null;
  /** Relative position of input box and label */
  isHorizontal?: boolean;
  /** Method returning true/false checking user input */
  validate?: (value: string) => boolean;
  /** Text to display to user is validation fails */
  errorPrompt?: (typeof StyledInputErrorPrompt)[keyof typeof StyledInputErrorPrompt];
  // Required to allow translations to be passed in e.g. t('ConfirmPassword')
  placeholder: string;
  /** Callback to trigger when return key is hit */
  submitOnEnter?: () => void;
  // New prop for external validation state
  isValid?: boolean;
};

/**
 * Our styled input box, supporting validation, highlighting on error
 * and some common styles
 */
export function StyledInput({
  label,
  onIonInput,
  validate,
  isHorizontal = false,
  errorPrompt,
  submitOnEnter,
  isValid: externalValid,
  ...props
}: StyledInputProps) {
  const [internalValid, setInternalValid] = useState(true);
  const { t } = useTranslation();
  const helpText = errorPrompt ? t(errorPrompt) : t('InvalidInput');

  // Use external validation state if provided, otherwise use internal state
  const inputValid =
    externalValid !== undefined ? externalValid : internalValid;

  function validateInput(ev: Event) {
    if (!validate) return;

    const value = (ev.target as HTMLInputElement).value;
    if (value === '') {
      setInternalValid(true);
      return;
    }
    validate(value) ? setInternalValid(true) : setInternalValid(false);
  }

  return (
    <IonItem
      className={isHorizontal ? 'styled-input-horizontal' : 'styled-input'}
      lines="none"
    >
      {label ? (
        <IonLabel
          style={{
            color: isHorizontal
              ? 'var(--ion-color-on-primary)'
              : 'var(--ion-color-primary-10)',
          }}
          position={isHorizontal ? undefined : 'stacked'}
        >
          {label}
        </IonLabel>
      ) : null}
      <IonInput
        className={!inputValid && !isHorizontal ? 'input-fail' : ''}
        onIonInput={(event) => {
          onIonInput && onIonInput(event);
          validateInput(event);
        }}
        onKeyPress={(e) =>
          e.key === 'Enter' && submitOnEnter && submitOnEnter()
        }
        {...props}
      ></IonInput>
      {!inputValid && <IonNote slot="error">{helpText}</IonNote>}
    </IonItem>
  );
}
