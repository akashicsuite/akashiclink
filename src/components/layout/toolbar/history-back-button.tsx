import styled from '@emotion/styled';
import { IonButton, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router';

import { type Url, urls } from '../../../constants/urls';
import {
  type LocationState,
  history,
  historyGoBackOrReplace,
} from '../../../routing/history';
import { akashicPayPath } from '../../../routing/navigation-tabs';

const BackButton = styled(IonButton)({
  marginLeft: -8,
  width: 32,
  height: 32,
  '--padding-start': 0,
  '--padding-end': 0,
});

export const HistoryBackButton = ({
  backButtonReplaceTarget = urls.dashboard,
}: {
  backButtonReplaceTarget?: Url;
}) => {
  // using this hook to get notified of any routing changes, and get the latest mutated `history`
  const routerHistory = useHistory<LocationState>();

  const onClickBackButton = () => {
    historyGoBackOrReplace(backButtonReplaceTarget);
  };

  const isInSendConfirmationPage =
    !!routerHistory.location.state?.sendConfirm?.txnFinal ||
    [
      akashicPayPath(urls.nftTransfer),
      akashicPayPath(urls.nftTransferResult),
      akashicPayPath(urls.sendConfirm),
    ].includes(routerHistory.location.pathname);

  if (history.index === 0 || isInSendConfirmationPage) return null;

  return (
    <BackButton size="small" fill="clear" onClick={onClickBackButton}>
      <IonIcon
        slot="icon-only"
        src={`/shared-assets/images/back-arrow-white.svg`}
      />
    </BackButton>
  );
};
