import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonNote,
  IonPopover,
  IonText,
} from '@ionic/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { displayLongText } from '../../utils/long-text';

export const ListCopyTxHashItem = ({
  txHash,
  txHashUrl,
  suffix,
  color,
}: {
  txHash: string;
  txHashUrl?: string;
  suffix?: string;
  color?: string;
}) => {
  const { t } = useTranslation();
  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const copyData = async (data: string, e: never) => {
    await Clipboard.write({
      string: data ?? '',
    });

    if (popover.current) {
      popover.current.event = e;
    }
    setPopoverOpen(true);
    setTimeout(() => {
      setPopoverOpen(false);
    }, 1000);
  };

  const onClickCopyIcon = async (e: never) => txHash && copyData(txHash, e);

  const onClickHash = async () => {
    txHashUrl &&
      (await Browser.open({
        url: txHashUrl,
      }));
  };

  return (
    <div
      className={
        'w-100 ion-display-flex ion-align-items-end ion-justify-content-between'
      }
    >
      <IonLabel style={{ color }}>
        <span className={`ion-color-primary ion-text-size-xs ion-text-bold`}>
          {t('txHash') + (suffix ? ` (${suffix})` : '')}
        </span>
      </IonLabel>
      <IonNote
        className={`ion-text-size-xs ion-display-flex ion-align-items-center`}
        style={{ color: color || 'var(--ion-text-color)' }}
        slot={'end'}
      >
        <IonText
          className={txHashUrl ? 'ion-text-underline' : ''}
          onClick={onClickHash}
        >
          {displayLongText(txHash)}
        </IonText>
        <div
          style={{ height: '18px', width: '18px' }}
          className="ion-margin-left-xs"
        >
          <IonIcon
            onClick={onClickCopyIcon}
            slot="icon-only"
            className="copy-icon"
            src={`/shared-assets/images/copy-icon-${
              suffix === 'AS' ? 'gray' : 'white'
            }.svg`}
          />
        </div>
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
      </IonNote>
    </div>
  );
};
