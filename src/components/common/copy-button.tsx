import { Clipboard } from '@capacitor/clipboard';
import { IonContent, IonPopover } from '@ionic/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SquareWhiteButton } from './buttons';
import { CopyIcon } from './icons/copy-icon';

export function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation();

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
      <CopyIcon slot="icon-only" />
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
