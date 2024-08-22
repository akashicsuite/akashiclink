import { Clipboard } from '@capacitor/clipboard';
import { IonContent, IonIcon, IonLabel, IonPopover } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import { BorderedBox } from './box/border-box';

export function CopyBox({
  compact = false,
  label,
  text,
  copyText,
}: {
  compact?: boolean;
  label?: string;
  text?: string;
  copyText?: string;
}) {
  const { t } = useTranslation();
  const storedTheme = useAppSelector(selectTheme);
  const handleCopy = async (e: never) => {
    await Clipboard.write({
      string: copyText || text || '',
    });

    if (popover.current) popover.current.event = e;
    setPopoverOpen(true);
    setTimeout(() => {
      setPopoverOpen(false);
    }, 1000);
  };

  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <>
      {label && <IonLabel class="ion-text-size-xs">{label}</IonLabel>}
      <BorderedBox compact={compact} lines="full" onClick={handleCopy}>
        <p className="ion-text-size-sm ion-text-bold">{text}</p>
        <IonIcon
          size={'small'}
          slot="end"
          className="icon-button-icon"
          src={`/shared-assets/images/${
            storedTheme === themeType.DARK
              ? 'copy-icon-white.svg'
              : 'copy-icon-dark.svg'
          }`}
        />
        <IonPopover
          side="top"
          alignment="center"
          ref={popover}
          isOpen={popoverOpen}
          className={'copied-popover'}
          onDidDismiss={() => setPopoverOpen(false)}
        >
          <IonContent class="ion-padding">{t('Copied')}</IonContent>
        </IonPopover>
      </BorderedBox>
    </>
  );
}
