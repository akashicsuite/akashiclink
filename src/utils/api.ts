import type {
  ICreateSecondaryOtk,
  ILookForL2Address,
  ILookForL2AddressResponse,
  IPrepareL1TxnResponse,
  IRetrieveIdentity,
  IRetrieveIdentityResponse,
  IWithdrawalProposal,
} from '@helium-pay/backend';

import { axiosBase } from './axios-helper';

const apiCall = async <T>(
  url: string,
  method: 'GET' | 'POST' = 'GET',
  data?: unknown
): Promise<T> => {
  const response = await axiosBase.request<T>({ url, method, data });
  if (response.status >= 400) {
    const errorData = response.data as { message?: string };
    const errorMessage =
      errorData?.message ?? `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.data;
};

export const OwnersAPI = {
  retrieveIdentity: async (
    retrieveData: IRetrieveIdentity
  ): Promise<IRetrieveIdentityResponse> => {
    const url = `/owner/retrieve-identity?publicKey=${retrieveData.publicKey}`;
    return await apiCall<IRetrieveIdentityResponse>(url);
  },

  lookForL2Address: async (
    l2Check: ILookForL2Address
  ): Promise<ILookForL2AddressResponse> => {
    let requestUrl = `/nft/look-for-l2-address?to=${l2Check.to}`;
    if (l2Check.coinSymbol) requestUrl += `&coinSymbol=${l2Check.coinSymbol}`;
    return await apiCall<ILookForL2AddressResponse>(requestUrl);
  },

  prepareL1Txn: async (
    transactionData: IWithdrawalProposal
  ): Promise<IPrepareL1TxnResponse> => {
    return await apiCall<IPrepareL1TxnResponse>(
      `/l1-txn-orchestrator/prepare-withdrawal`,
      'POST',
      JSON.stringify(transactionData)
    );
  },

  generateSecondaryOtk: async (
    signedReq: ICreateSecondaryOtk
  ): Promise<void> => {
    apiCall<void>(
      `/owner/generate-secondary-otk`,
      'POST',
      JSON.stringify(signedReq)
    );
  },
};
