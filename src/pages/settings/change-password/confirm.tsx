import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../../../components/common/buttons';
import { SuccessfulIconWithTitle } from '../../../components/common/state-icon-with-title/successful-icon-with-title';
import { DashboardLayout } from '../../../components/page-layout/dashboard-layout';
import { SettingsWrapper } from '../../../components/settings/base-components';
import { useLogout } from '../../../utils/hooks/useLogout';

export function ChangePasswordConfirm() {
  const { t } = useTranslation();
  const logout = useLogout();

  return (
    <DashboardLayout>
      <SettingsWrapper
        className="ion-justify-content-center ion-align-items-center"
        style={{ padding: '160px 56px' }}
      >
        <div className="ion-margin-bottom w-100">
          <SuccessfulIconWithTitle title={t('PasswordChangeSuccess')} />
        </div>
        <PrimaryButton className="w-100" expand="block" onClick={logout}>
          {t('Confirm')}
        </PrimaryButton>
      </SettingsWrapper>
    </DashboardLayout>
  );
}
