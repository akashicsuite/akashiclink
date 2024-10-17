import styled from '@emotion/styled';
import { LANGUAGE_LIST } from '@helium-pay/common-i18n/src/locales/supported-languages';
import { IonButton, IonIcon, IonItem, IonList, IonPopover } from '@ionic/react';
import { caretDownOutline, globeOutline } from 'ionicons/icons';
import type { SyntheticEvent } from 'react';
import { useRef, useState } from 'react';

import { useSetGlobalLanguage } from '../../../utils/hooks/useSetGlobalLanguage';

const LanguagePopover = styled(IonPopover)({
  '--max-width': 'fit-content',
  ['ion-list']: {
    backgroundColor: 'var(--ion-color-dark-contrast)',
  },
});

const LanguageButton = styled(IonButton)({
  /* Padding removed around button  */
  '--padding-start': '0 !important',
  '--padding-end': '0 !important',
  '--padding-top': '0 !important',
  '--padding-bottom': '0 !important',

  /* Dark colouring  */
  color: 'var(--ion-color-primary-10)',
  '--background-hover': 'none',
  '--ripple-color': 'transparent',
});

export const LanguageDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLIonPopoverElement>(null);

  const [globalLanguage, setGlobalLanguage] = useSetGlobalLanguage();

  const openPopover = (e: SyntheticEvent) => {
    if (popover.current) popover.current.event = e;
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <LanguageButton
        className="language-button"
        fill="clear"
        onClick={(e) => {
          openPopover(e);
        }}
      >
        <IonIcon
          style={{ fontSize: 24 }}
          slot="icon-only"
          icon={globeOutline}
        />
        <IonIcon style={{ fontSize: 14 }} slot="end" icon={caretDownOutline} />
      </LanguageButton>
      <LanguagePopover
        side="bottom"
        alignment="end"
        className="language-popover"
        dismissOnSelect={true}
        onDidDismiss={() => {
          setIsOpen(false);
        }}
        ref={popover}
        isOpen={isOpen}
      >
        <IonList
          lines="none"
          className="ion-padding-0"
          style={{ backgroundColor: 'var(--ion-modal-background)' }}
        >
          {LANGUAGE_LIST.map((item) => (
            <IonItem
              className={item.locale === globalLanguage ? 'ion-focused' : ''}
              key={item.locale}
              button={true}
              detail={false}
              onClick={(_) => setGlobalLanguage(item.locale)}
            >
              {item.title}
            </IonItem>
          ))}
        </IonList>
      </LanguagePopover>
    </div>
  );
};
