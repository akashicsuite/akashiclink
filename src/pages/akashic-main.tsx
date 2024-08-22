import './akashic-main.scss';

import { IonImg, isPlatform } from '@ionic/react';

import { PublicLayout } from '../components/page-layout/public-layout';
import { CreateOrImportForm } from '../components/wallet-setup/create-or-import-form';
import { LoginForm } from '../components/wallet-setup/login-form';
import { useAccountStorage } from '../utils/hooks/useLocalAccounts';

/**
 * First page seen by user when navigating to app
 * or opening extension.
 * - Logic to automatically restore previous session view
 * - Logic to present user when import or login menues depending
 *   on whether this is first login with this device
 */
export function AkashicPayMain({ isPopup = false }) {
  const isMobile = isPlatform('mobile');
  const { localAccounts } = useAccountStorage();

  return (
    <PublicLayout>
      <IonImg
        className={`
          ion-margin-auto 
          ${
            isMobile || !localAccounts.length
              ? 'welcome-img'
              : 'welcome-img-small'
          }
        `}
        alt="welcome"
      />
      {localAccounts.length ? (
        <LoginForm isPopup={isPopup} />
      ) : (
        <CreateOrImportForm />
      )}
    </PublicLayout>
  );
}
