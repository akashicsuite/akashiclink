import { IonRouterOutlet } from '@ionic/react';
import { useCallback, useEffect } from 'react';
import { Redirect } from 'react-router';

import { urls } from '../constants/urls';
import { AkashicPayMain } from '../pages/akashic-main';
import { CreateWalletPassword } from '../pages/create-wallet/create-wallet-create-password';
import { CreateWalletSecret } from '../pages/create-wallet/create-wallet-secret';
import { CreateWalletSecretConfirm } from '../pages/create-wallet/create-wallet-secret-confirm';
import { CreateWalletSuccessful } from '../pages/create-wallet/create-wallet-successful';
import { ImportWalletKeypair } from '../pages/import-wallet/import-wallet-keypair';
import { ImportWalletPassword } from '../pages/import-wallet/import-wallet-password';
import { ImportWalletSecret } from '../pages/import-wallet/import-wallet-secret';
import { ImportWalletSelectMethod } from '../pages/import-wallet/import-wallet-select-method';
import { ImportWalletSuccessful } from '../pages/import-wallet/import-wallet-successful';
import { AkashicTab } from '../routing/navigation-tabs';
import {
  EXTENSION_EVENT,
  responseToSite,
  WALLET_METHOD,
} from '../utils/chrome';

export function PopupUnlockOrCreateAndImportWallet() {
  const onPopupClosed = useCallback(() => {
    responseToSite({
      method: WALLET_METHOD.UNLOCK_WALLET,
      event: EXTENSION_EVENT.USER_CLOSED_POPUP,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', onPopupClosed);
    return () => {
      window.removeEventListener('beforeunload', onPopupClosed);
    };
  }, []);

  return (
    <IonRouterOutlet ionPage animated={false}>
      {AkashicTab.registerPage(() => (
        <AkashicPayMain isPopup />
      ))}
      {/* create wallet flow */}
      {AkashicTab.registerPage(CreateWalletPassword, urls.createWalletPassword)}
      {AkashicTab.registerPage(
        CreateWalletSecret,
        urls.createWalletSecretPhrase
      )}
      {AkashicTab.registerPage(
        () => (
          <CreateWalletSecretConfirm isPopup />
        ),
        urls.createWalletSecretPhraseConfirm
      )}
      {AkashicTab.registerPage(
        CreateWalletSuccessful,
        urls.createWalletSuccessful
      )}
      {/* import wallet flow */}
      {AkashicTab.registerPage(
        ImportWalletSelectMethod,
        urls.importWalletSelectMethod
      )}
      {AkashicTab.registerPage(
        ImportWalletSecret,
        urls.importWalletSecretPhrase
      )}
      {AkashicTab.registerPage(ImportWalletKeypair, urls.importWalletKeypair)}
      {AkashicTab.registerPage(
        () => (
          <ImportWalletPassword isPopup />
        ),
        urls.importWalletPassword
      )}
      {AkashicTab.registerPage(
        ImportWalletSuccessful,
        urls.importWalletSuccessful
      )}
      <Redirect to={AkashicTab.root} />
      <Redirect exact from="/" to={AkashicTab.root} />
    </IonRouterOutlet>
  );
}
