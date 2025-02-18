import { AddressScreeningForm } from '../../components/address-screening/address-screening-form';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';

export function AddressScreeningNewScan() {
  return (
    <DashboardLayout showSwitchAccountBar showAddress>
      <AddressScreeningForm />
    </DashboardLayout>
  );
}
