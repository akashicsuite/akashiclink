import { Preferences } from '@capacitor/preferences';
import type { ITransactionProposalClientSideOtk } from '@helium-pay/backend';
import { createMemoryHistory } from 'history';

import type { SendConfirmationTxnsDetail } from '../components/send-deposit/send-form/types';
import { LAST_HISTORY_ENTRIES } from '../constants';
import type { Url } from '../constants/urls';
import { urls } from '../constants/urls';
import type { TransferResultType } from '../pages/nft/nft-transfer-result';
import type { ITransactionRecordForExtension } from '../utils/formatTransfers';
import { akashicPayPath } from './navigation-tabs';

export const history = createMemoryHistory();

export interface LocationState {
  nft?: {
    nftName?: string;
  };
  nftTransferResult?: {
    transaction?: TransferResultType;
    errorMsg?: string;
  };
  sendConfirm?: SendConfirmationTxnsDetail;
  sendResult?: {
    fromAddress: string;
    transaction?: ITransactionProposalClientSideOtk[];
    errorMsg?: string;
    currencyDisplayName?: string;
  };
  activityDetails?: {
    currentTransfer?: ITransactionRecordForExtension;
  };
  changePassword?: {
    isChanged?: boolean;
  };
}

export const historyResetStackAndRedirect = async (
  url: Url = urls.dashboard,
  state?: Record<string, unknown>
) => {
  history.entries = [history.entries[0]];
  history.length = 1;
  history.index = 0;
  history.replace(akashicPayPath(url), state);
  // set Preferences AFTER history is mutated
  await Preferences.set({
    key: LAST_HISTORY_ENTRIES,
    value: JSON.stringify(history.entries),
  });
};

export const historyGoBackOrReplace = async (
  url: Url = urls.dashboard,
  state?: Record<string, unknown>
) => {
  if (history.length > 1) {
    history.goBack();
    history.entries.pop();
    history.length--;
  } else {
    history.replace(akashicPayPath(url), state);
  }
  // set Preferences AFTER history is mutated
  await Preferences.set({
    key: LAST_HISTORY_ENTRIES,
    value: JSON.stringify(history.entries),
  });
};

export const historyGo = async (
  url: Url = urls.dashboard,
  state?: Record<string, unknown>
) => {
  if (history.location.pathname === akashicPayPath(url)) {
    return;
  }
  history.push(akashicPayPath(url), state);
  // set Preferences AFTER history is mutated
  await Preferences.set({
    key: LAST_HISTORY_ENTRIES,
    value: JSON.stringify(history.entries),
  });
};

export const historyReplace = async (
  url: Url = urls.dashboard,
  state?: Record<string, unknown>
) => {
  history.replace(akashicPayPath(url), state);
  // set Preferences AFTER history is mutated
  await Preferences.set({
    key: LAST_HISTORY_ENTRIES,
    value: JSON.stringify(history.entries),
  });
};
