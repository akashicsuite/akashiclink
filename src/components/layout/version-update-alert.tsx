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
  const { config } = useConfig();

  const [, setAvailableVersion] = useLocalStorage('available-app-version', '');
  const [, setUpdateUrl] = useLocalStorage('update-url', '');
  const [skipVersion, setSkipVersion] = useLocalStorage('skip-version', '');
  const [updateType, setUpdateType] = useLocalStorage('update-type', '');
  const [, setHighlights] = useLocalStorage('highlights', ['']);
  const info = useCurrentAppInfo();

  useEffect(() => {
    const appVersion = info?.version?.split('-')[0];

    // compare when all versions are loaded
    if (!appVersion || !config) {
      setUpdateType('');
      return;
    }

    setAvailableVersion(config.awLatestVersion);
    setUpdateUrl(config.awUrl);

    if (compareVersions(appVersion, config.awMinVersion) === -1) {
      setUpdateType('hard');
    } else if (
      // check if skip before
      skipVersion !== config.awLatestVersion &&
      compareVersions(appVersion, config.awLatestVersion) === -1
    ) {
      setUpdateType('soft');
      setHighlights(config.highlights || ['']);
    }
  }, [config, skipVersion, info]);

  return (
    <IonAlert
      isOpen={updateType === 'soft' || updateType === 'hard'}
      onDidDismiss={() => updateType === 'soft' && setUpdateType('')}
      backdropDismiss={false}
      header={t('NewVersionAvailable')}
      message={t('NewVersionAvailableMessage')}
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
