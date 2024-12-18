import styled from '@emotion/styled';
import { IonContent, IonIcon, IonPopover } from '@ionic/react';
import { useRef } from 'react';

import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';

const StyledIonPopover = styled(IonPopover)`
  --max-width: 160px;

  &::part(content) {
    background-color: var(--ion-color-inverse-surface);
    padding: 8px;
  }
  ion-content {
    --max-width: 160px;
    --color: var(--ion-color-dark-contrast);
  }
`;

export function Tooltip({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const storedTheme = useAppSelector(selectTheme);

  const copyPopoverRef = useRef<HTMLIonPopoverElement>(null);

  return (
    <span
      className={className}
      style={{
        width: 16,
        height: 16,
      }}
    >
      <IonIcon
        id="info-icon"
        src={`/shared-assets/images/info-icon-${
          storedTheme === themeType.DARK ? 'white' : 'dark'
        }.svg`}
        style={{
          width: 16,
          height: 16,
          cursor: 'pointer',
          display: 'inline-block',
        }}
      />
      <StyledIonPopover
        side="bottom"
        alignment="center"
        trigger="info-icon"
        ref={copyPopoverRef}
        showBackdrop={false}
      >
        <IonContent class="ion-text-size-xs">{content}</IonContent>
      </StyledIonPopover>
    </span>
  );
}
