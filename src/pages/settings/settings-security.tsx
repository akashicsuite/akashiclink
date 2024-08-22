import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import {
  PageHeader,
  SettingsWrapper,
} from '../../components/settings/base-components';
import type { SettingItemProps } from '../../components/settings/setting-item';
import { SettingItem } from '../../components/settings/setting-item';
import { urls } from '../../constants/urls';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { getImageIconUrl } from '../../utils/url-utils';

export function SettingsSecurity() {
  const { t } = useTranslation();
  const history = useHistory();
  const securityMenuItems: SettingItemProps[] = [
    {
      header: t('KeyPairBackup'),
      iconUrl: getImageIconUrl('key-pair-backup.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.settingsBackup));
      },
    },
    {
      header: t('ChangePassword'),
      iconUrl: getImageIconUrl('change-password.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.changePassword));
      },
    },
  ];
  return (
    <DashboardLayout showSwitchAccountBar>
      <SettingsWrapper>
        <PageHeader>{t('Security')}</PageHeader>
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {securityMenuItems.map((securityMenuItem, index) => {
            return (
              <SettingItem
                backgroundColor="var(--ion-background)"
                key={index}
                iconUrl={securityMenuItem.iconUrl}
                header={securityMenuItem.header}
                onClick={securityMenuItem.onClick}
                endComponent={securityMenuItem.endComponent}
                isAccordion={securityMenuItem.isAccordion}
              >
                {securityMenuItem.children}
              </SettingItem>
            );
          })}
        </div>
      </SettingsWrapper>
    </DashboardLayout>
  );
}
