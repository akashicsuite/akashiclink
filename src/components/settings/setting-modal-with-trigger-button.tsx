import { IonIcon } from '@ionic/react';
import { useRef, useState } from 'react';

import { getImageIconUrl } from '../../utils/url-utils';
import { SettingModal } from './setting-modal';

export function SettingModalWithTriggerButton() {
  const modal = useRef<HTMLIonModalElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <IonIcon
        className="ion-padding-top-xs ion-padding-bottom-xs ion-padding-left-xs ion-padding-right-xs"
        style={{
          height: '24px',
          width: '24px',
          cursor: 'pointer',
          marginRight: -8,
        }}
        src={getImageIconUrl('setting-menu-primary.svg')}
        onClick={() => {
          setModalOpen(!modalOpen);
        }}
      />
      <SettingModal modal={modal} isOpen={modalOpen} setIsOpen={setModalOpen} />
    </>
  );
}
