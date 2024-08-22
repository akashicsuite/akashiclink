import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { SendConfirmationForm } from '../../components/send-deposit/send-confirmation-form/send-confirmation-form';
import { useDisableDeviceBackButton } from '../../utils/hooks/useDisableDeviceBackButton';

export function SendConfirmationPage() {
  useDisableDeviceBackButton();

  return (
    <DashboardLayout showSwitchAccountBar showAddress>
      <SendConfirmationForm />
    </DashboardLayout>
  );
}
