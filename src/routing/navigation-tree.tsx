import { Preferences } from '@capacitor/preferences';
import { IonRouterOutlet, isPlatform } from '@ionic/react';
import type { Location } from 'history';
import { useEffect, useState } from 'react';
import { Redirect } from 'react-router';

import { Spinner } from '../components/common/loader/spinner';
import { LAST_HISTORY_ENTRIES } from '../constants';
import { urls } from '../constants/urls';
import { Activity } from '../pages/activity/activity';
import { ActivityDetails } from '../pages/activity/activity-details';
import { AkashicPayMain } from '../pages/akashic-main';
import { CreateWalletPassword } from '../pages/create-wallet/create-wallet-create-password';
import { CreateWalletSecret } from '../pages/create-wallet/create-wallet-secret';
import { CreateWalletSecretConfirm } from '../pages/create-wallet/create-wallet-secret-confirm';
import { CreateWalletSuccessful } from '../pages/create-wallet/create-wallet-successful';
import { Dashboard } from '../pages/dashboard/dashboard';
import { DepositPage } from '../pages/deposit/deposit-page';
import { ErrorPage } from '../pages/error';
import { ImportWalletKeypair } from '../pages/import-wallet/import-wallet-keypair';
import { ImportWalletPassword } from '../pages/import-wallet/import-wallet-password';
import { ImportWalletSecret } from '../pages/import-wallet/import-wallet-secret';
import { ImportWalletSelectMethod } from '../pages/import-wallet/import-wallet-select-method';
import { ImportWalletSuccessful } from '../pages/import-wallet/import-wallet-successful';
import { ManageAccounts } from '../pages/manage-accounts/manage-accounts';
import { Nft } from '../pages/nft/nft';
import { NftTransfer } from '../pages/nft/nft-transfer';
import { NftTransferResult } from '../pages/nft/nft-transfer-result';
import { Nfts } from '../pages/nft/nfts';
import { SendPage } from '../pages/send/send';
import { SendConfirmationPage } from '../pages/send/send-confirmation';
import { ChangePasswordConfirm } from '../pages/settings/change-password/confirm';
import { ChangePassword } from '../pages/settings/change-password/enter-passwords';
import { Settings } from '../pages/settings/settings';
import { SettingsAboutUs } from '../pages/settings/settings-about-us';
import { SettingsBackup } from '../pages/settings/settings-backup';
import { SettingsGeneral } from '../pages/settings/settings-general';
import { SettingsNetwork } from '../pages/settings/settings-network';
import { SettingsSecurity } from '../pages/settings/settings-security';
import { useAppDispatch, useAppSelector } from '../redux/app/hooks';
import type { RootState } from '../redux/app/store';
import { onClear as onClearCreate } from '../redux/slices/createWalletSlice';
import { onClear as onClearImport } from '../redux/slices/importWalletSlice';
import { useLogout } from '../utils/hooks/useLogout';
import { history } from './history';
import { AkashicTab } from './navigation-tabs';

export function NavigationTree() {
  const reduxLastLocation = useAppSelector(
    (state: RootState) => state?.router?.location
  );
  const logout = useLogout();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectToLastLocation = async () => {
      if (
        !reduxLastLocation ||
        reduxLastLocation.pathname === history.location.pathname
      ) {
        setIsLoading(false);
        return;
      }

      if (isPlatform('ios') || isPlatform('android')) {
        dispatch(onClearCreate());
        dispatch(onClearImport());
        await logout();
        setIsLoading(false);
        return;
      }

      // Saved history stack
      const lastHistoryJson = await Preferences.get({
        key: LAST_HISTORY_ENTRIES,
      });
      const lastHistory = JSON.parse(lastHistoryJson?.value || '{}');

      // rebuild history entries completely if stack is saved before
      if (Array.isArray(lastHistory) && lastHistory.length > 0) {
        history.entries = [];
        history.index = -1;
        history.length = 0;
        lastHistory.forEach((entry: Location) => {
          history.push(entry.pathname, entry.state);
        });
      }

      // Remove the last-location as history is now reset
      await Preferences.remove({ key: LAST_HISTORY_ENTRIES });

      setIsLoading(false);
    };
    setTimeout(redirectToLastLocation, 1000);
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <IonRouterOutlet ionPage animated={false}>
      {/* AkashicPay tree - default so redirect at bottom */}
      {AkashicTab.registerPage(AkashicPayMain)}
      {AkashicTab.registerPage(AkashicPayMain, urls.akashicPay)}
      {AkashicTab.registerPage(ManageAccounts, urls.manageAccounts)}
      {AkashicTab.registerPage(Dashboard, urls.dashboard)}
      {AkashicTab.registerPage(DepositPage, urls.deposit)}
      {AkashicTab.registerPage(SendPage, urls.sendTo)}
      {AkashicTab.registerPage(SendConfirmationPage, urls.sendConfirm)}
      {AkashicTab.registerPage(Nfts, urls.nfts)}
      {AkashicTab.registerPage(Nft, urls.nft)}
      {AkashicTab.registerPage(NftTransfer, urls.nftTransfer)}
      {AkashicTab.registerPage(NftTransferResult, urls.nftTransferResult)}
      {AkashicTab.registerPage(Activity, urls.activity)}
      {AkashicTab.registerPage(Settings, urls.settings)}
      {AkashicTab.registerPage(SettingsGeneral, urls.settingsGeneral)}
      {AkashicTab.registerPage(SettingsSecurity, urls.settingsSecurity)}
      {AkashicTab.registerPage(SettingsNetwork, urls.settingsNetwork)}
      {AkashicTab.registerPage(SettingsBackup, urls.settingsBackup)}
      {AkashicTab.registerPage(SettingsAboutUs, urls.settingsAboutUs)}
      {AkashicTab.registerPage(ChangePassword, urls.changePassword)}
      {AkashicTab.registerPage(ActivityDetails, urls.activityDetails)}
      {AkashicTab.registerPage(
        ChangePasswordConfirm,
        urls.changePasswordConfirm
      )}
      {AkashicTab.registerPage(ErrorPage, urls.error)}
      {/* create wallet flow */}
      {AkashicTab.registerPage(CreateWalletPassword, urls.createWalletPassword)}
      {AkashicTab.registerPage(
        CreateWalletSecret,
        urls.createWalletSecretPhrase
      )}
      {AkashicTab.registerPage(
        CreateWalletSecretConfirm,
        urls.createWalletSecretPhraseConfirm
      )}
      {AkashicTab.registerPage(
        CreateWalletSuccessful,
        urls.createWalletSuccessful
      )}
      {/* import wallet flow */}
      {AkashicTab.registerPage(
        ImportWalletSecret,
        urls.importWalletSecretPhrase
      )}
      {AkashicTab.registerPage(ImportWalletPassword, urls.importWalletPassword)}
      {AkashicTab.registerPage(
        ImportWalletSelectMethod,
        urls.importWalletSelectMethod
      )}
      {AkashicTab.registerPage(
        ImportWalletSuccessful,
        urls.importWalletSuccessful
      )}
      {AkashicTab.registerPage(ImportWalletKeypair, urls.importWalletKeypair)}
      {/* US² tree */}
      {/* {Us2Tab.registerPage(Us2Main)} */}
      {/* Default redirect */}
      {/* https://github.com/ionic-team/ionic-framework/issues/24855 */}
      <Redirect to={AkashicTab.root} />
      <Redirect exact from="/" to={AkashicTab.root} />
    </IonRouterOutlet>
  );
}
