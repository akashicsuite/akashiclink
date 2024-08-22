import './send.scss';

import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { SendForm } from '../../components/send-deposit/send-form/send-form';

export function SendPage() {
  return (
    <DashboardLayout showSwitchAccountBar showAddress>
      <SendForm />
    </DashboardLayout>
  );
}
