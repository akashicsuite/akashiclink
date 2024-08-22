import { useTranslation } from 'react-i18next';

import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { AboutUs } from '../../components/settings/about-us';
import {
  PageHeader,
  SettingsWrapper,
} from '../../components/settings/base-components';

export function SettingsAboutUs() {
  const { t } = useTranslation();
  return (
    <DashboardLayout showSwitchAccountBar>
      <SettingsWrapper>
        <PageHeader>{t('AboutUs')}</PageHeader>
        <AboutUs backgroundColor="var(--ion-background)" />
      </SettingsWrapper>
    </DashboardLayout>
  );
}
