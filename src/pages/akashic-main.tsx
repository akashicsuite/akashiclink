import './akashic-main.scss';

import { IonImg, isPlatform } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router';

import { WelcomeScreen } from '../components/common/loader/welcomeScreen';
import { OperationAnnouncementAlert } from '../components/layout/operation-announcement-alert';
import { PublicLayout } from '../components/page-layout/public-layout';
import { CreateOrImportForm } from '../components/wallet-setup/create-or-import-form';
import { LoginForm } from '../components/wallet-setup/login-form';
import type { LocationState } from '../routing/history';
import { useAccountStorage } from '../utils/hooks/useLocalAccounts';

/**
 * First page seen by user when navigating to app
 * or opening extension.
 * - Logic to automatically restore previous session view
 * - Logic to present user when import or login menues depending
 *   on whether this is first login with this device
 */
export function AkashicPayMain({ isPopup = false }) {
  const history = useHistory<LocationState>();
  const { localAccounts } = useAccountStorage();

  const query = new URLSearchParams(window.location.search);
  const type = query.get('type');

  const [showSplash, setShowSplash] = useState(
    !history.location.state?.isManualLogout && type !== 'webPageRequest'
  );

  const isMobile = isPlatform('ios') || isPlatform('android');

  return (
    <>
      {showSplash && <WelcomeScreen onFinish={() => setShowSplash(false)} />}
      <PublicLayout
        contentStyle={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: `calc(50vh - ${isMobile ? '176px - 64px - var(--ion-safe-area-top)' : '240px'} )`,
        }}
      >
        <IonImg
          alt=""
          src={`/assets/images/akashic-logo.png`}
          style={{
            height: '84px',
            width: '120px',
            display: 'block',
            margin: '0 auto',
            opacity: showSplash ? 0 : 1,
          }}
        />
        {localAccounts.length ? (
          <LoginForm isPopup={isPopup} />
        ) : (
          <CreateOrImportForm />
        )}
      </PublicLayout>
      {!showSplash && <OperationAnnouncementAlert />}
    </>
  );
}
