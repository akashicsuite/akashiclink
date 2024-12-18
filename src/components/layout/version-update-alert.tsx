import { Browser } from '@capacitor/browser';
import { IonAlert } from '@ionic/react';
import { compareVersions } from 'compare-versions';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useConfig } from '../../utils/hooks/useConfig';
import { useCurrentAppInfo } from '../../utils/hooks/useCurrentAppInfo';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';

export const VersionUpdateAlert = () => {
  const { t } = useTranslation();
  const { config, isLoading } = useConfig();

  const [, setAvailableVersion] = useLocalStorage('available-app-version', '');
  const [, setUpdateUrl] = useLocalStorage('update-url', '');
  const [skipVersion, setSkipVersion] = useLocalStorage('skip-version', '');
  const [updateType, setUpdateType] = useLocalStorage('update-type', '');
  const [, setHighlights] = useLocalStorage('highlights', ['']);
  const info = useCurrentAppInfo();

  useEffect(() => {
    const getUpdateType = async () => {
      const appVersion = info?.version?.split('-')[0];

      // compare when all versions are loaded
      if (!appVersion || !config) {
        await setUpdateType('');
        return;
      }

      await setAvailableVersion(config.awLatestVersion);
      await setUpdateUrl(config.awUrl);

      if (compareVersions(appVersion, config.awMinVersion) === -1) {
        await setUpdateType('hard');
      } else if (
        // check if skip before
        skipVersion !== config.awLatestVersion &&
        compareVersions(appVersion, config.awLatestVersion) === -1
      ) {
        await setUpdateType('soft');
        await setHighlights(config.highlights || ['']);
      } else {
        await setUpdateType('');
      }
    };

    if (!isLoading) {
      getUpdateType();
    }
  }, [isLoading, config, skipVersion, info]);

  return (
    <IonAlert
      isOpen={!isLoading && (updateType === 'soft' || updateType === 'hard')}
      onDidDismiss={() => updateType === 'soft' && setUpdateType('')}
      backdropDismiss={false}
      header={t('NewVersionAvailable')}
      message={t('NewVersionAvailableMessage')}
      cssClass={'force-update-alert'}
      buttons={[
        ...(config && updateType === 'soft'
          ? [
              {
                text: t('Later'),
                role: 'cancel',
                handler: () => {
                  setSkipVersion(config.awLatestVersion);
                },
              },
            ]
          : []),
        ...(config
          ? [
              {
                text: t('Update'),
                role: 'confirm',
                handler: async () => {
                  setSkipVersion(config.awLatestVersion);
                  await Browser.open({
                    url: config.awUrl,
                  });
                  // make it non dismissible
                  return false;
                },
              },
            ]
          : []),
      ]}
    />
  );
};
