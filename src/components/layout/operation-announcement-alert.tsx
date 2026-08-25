import { IonAlert } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Module-scoped so the alert survives layout remounts on navigation, but resets
 * when the popup is closed and reopened - a fresh JS context per launch.
 */
let dismissed = false;

export const OperationAnnouncementAlert = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(!dismissed);

  const handleDismiss = () => {
    dismissed = true;
    setIsOpen(false);
  };

  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={handleDismiss}
      header={t('OperationAnnouncementTitle')}
      message={t('OperationAnnouncementMessage')}
      buttons={[{ text: t('Ok'), role: 'confirm' }]}
    />
  );
};
