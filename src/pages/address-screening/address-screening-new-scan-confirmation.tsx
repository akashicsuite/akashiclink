import { AddressScreeningConfirmationForm } from '../../components/address-screening/address-screening-confirmation-form';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { useDisableDeviceBackButton } from '../../utils/hooks/useDisableDeviceBackButton';

export function AddressScreeningNewScanConfirmation() {
  useDisableDeviceBackButton();

  return (
    <DashboardLayout showSwitchAccountBar showAddress>
      <AddressScreeningConfirmationForm />
    </DashboardLayout>
  );
}
