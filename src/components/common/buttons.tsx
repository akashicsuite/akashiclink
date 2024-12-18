import type { CSSInterpolation } from '@emotion/serialize/types';
import styled from '@emotion/styled';
import { IonButton, IonSpinner } from '@ionic/react';
import type { CSSProperties } from 'react';

type IonButtonProps = React.ComponentProps<typeof IonButton>;

const squareButtonBaseCss: CSSInterpolation = {
  border: '1px solid transparent',
  borderRadius: '4px',
  textAlign: 'center',
  height: '32px',
};

const buttonBaseCss: CSSInterpolation = {
  border: '1px solid transparent',
  borderRadius: '100px !important',
  textAlign: 'center',
  height: '40px',
  letterSpacing: '0.01rem',
};

const buttonTextBaseCss: CSSInterpolation = {
  fontWeight: 700,
  fontSize: '14px',
  lineHeight: '20px',
  textTransform: 'none',
};

const whiteButtonBase: CSSInterpolation = {
  background: 'var(--ion-button-background)',
  borderColor: '#74777D',
  color: 'var(--ion-white-button-text)',
  ['&:active, &:focus, &:hover']: {
    background: 'rgba(89, 89, 146, 0.08)',
  },
};

const whiteButtonCss: CSSInterpolation = {
  ['&::part(native)']: {
    ...buttonBaseCss,
    ...whiteButtonBase,
    ...buttonTextBaseCss,
  },
};

const tabButtonCss: CSSInterpolation = {
  ['&::part(native)']: {
    color: 'var(--ion-color-primary-10)',
    background: 'transparent',
    boxShadow: 'none',
    borderBottom: '2px solid #CCC4CF',
    borderRadius: '0',
    ...buttonTextBaseCss,
  },
  ['&:active, &:focus, &:hover']: {
    background: 'rgba(89, 89, 146, 0.08)',
  },
  ['&.open::part(native)']: {
    borderBottom: '2px solid #A2A2FF',
    background: 'transparent',
  },
};

const PrimaryButtonCSS = styled(IonButton)<{ disabled?: boolean }>`
  &::part(native) {
    ${buttonBaseCss}
    ${buttonTextBaseCss}
    &:hover {
      box-shadow: 0px 3px 2px 0px rgba(0, 0, 0, 0.3);
    }
  }
`;

export const PrimaryButton = ({
  isLoading,
  disabled,
  children,
  ...props
}: IonButtonProps & { isLoading?: boolean; disabled?: boolean }) => (
  <PrimaryButtonCSS disabled={isLoading || disabled} {...props}>
    {children}
    {isLoading && (
      <IonSpinner
        style={{ width: 20 }}
        className={children ? 'ion-margin-left-xs' : ''}
        slot="end"
        name="circular"
      />
    )}
  </PrimaryButtonCSS>
);

export const WhiteButtonCSS = styled(IonButton)<{ disabled?: boolean }>`
  ${whiteButtonCss}
  &::part(native) {
    ${(props) =>
      props.disabled
        ? 'color: var(--ion-white-button-text);'
        : 'color: var(--ion-color-primary);'}
  }
`;

export const WhiteButton = ({
  isLoading,
  disabled,
  children,
  ...props
}: IonButtonProps & { isLoading?: boolean; disabled?: boolean }) => (
  <WhiteButtonCSS disabled={isLoading || disabled} {...props}>
    {children}
    {isLoading && (
      <IonSpinner
        style={{ width: 20 }}
        className={children ? 'ion-margin-left-xs' : ''}
        slot="end"
        name="circular"
      />
    )}
  </WhiteButtonCSS>
);

export const OutlineButton = styled(IonButton)({
  ['&::part(native)']: {
    ...buttonBaseCss,
    ...whiteButtonBase,
    ...buttonTextBaseCss,
    background: 'transparent',
  },
});

export const SquareWhiteButton = styled(IonButton, {
  shouldForwardProp: (props) =>
    props !== 'forceStyle' && props !== 'borderRadius',
})<{ forceStyle?: CSSProperties; borderRadius?: string | number }>(
  ({ forceStyle, borderRadius }) => ({
    ['&::part(native)']: {
      ...squareButtonBaseCss,
      ...whiteButtonBase,
      ...buttonTextBaseCss,
      ...(forceStyle ? forceStyle : {}),
      borderRadius: borderRadius || squareButtonBaseCss.borderRadius,
    },
  })
);

export const TabButton = styled(IonButton)({
  ...tabButtonCss,
});

/** Button is just underlined text */
export const TextButton = styled(IonButton)({
  background: 'none',
  textDecoration: 'underline',
  minHeight: 0,
  ['&::part(native)']: {
    padding: 4,
  },
});
