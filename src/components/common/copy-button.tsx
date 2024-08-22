import { Clipboard } from '@capacitor/clipboard';
import { IonContent, IonIcon, IonPopover } from '@ionic/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';
import { SquareWhiteButton } from './buttons';

export function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation();
  const storedTheme = useAppSelector(selectTheme);

  const copyPopoverRef = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const copyValue = async (e: never) => {
    await Clipboard.write({
      string: value ?? '',
    });

    if (copyPopoverRef.current) {
      copyPopoverRef.current.event = e;
    }
    setPopoverOpen(true);
    setTimeout(() => {
      setPopoverOpen(false);
    }, 1000);
  };

  return (
    <SquareWhiteButton className="icon-button" onClick={copyValue}>
      <IonIcon
        className="icon-button-icon"
        slot="icon-only"
        src={`/shared-assets/images/copy-icon-${
          storedTheme === themeType.DARK ? 'white' : 'dark'
        }.svg`}
      />
      <IonPopover
        side="top"
        alignment="center"
        ref={copyPopoverRef}
        isOpen={popoverOpen}
        className={'copied-popover'}
        onDidDismiss={() => setPopoverOpen(false)}
      >
        <IonContent class="ion-padding">{t('Copied')}</IonContent>
      </IonPopover>
    </SquareWhiteButton>
  );
}
