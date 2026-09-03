import { IonAlert } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Module-scoped so an alert survives layout remounts on navigation, but resets
 * when the popup is closed and reopened - a fresh JS context per launch.
 */
const dismissed = new Set<string>();

export const AnnouncementAlert = ({ messageKey }: { messageKey: string }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(!dismissed.has(messageKey));

  const handleDismiss = () => {
    dismissed.add(messageKey);
    setIsOpen(false);
  };

  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={handleDismiss}
      header={t('OperationAnnouncementTitle')}
      message={t(messageKey)}
      buttons={[{ text: t('Ok'), role: 'confirm' }]}
    />
  );
};
