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

export const OwnersAPI = {
  retrieveIdentity: async (
    retrieveData: IRetrieveIdentity
  ): Promise<IRetrieveIdentityResponse> => {
    const response = await axiosBase.get(
      `/owner/retrieve-identity?publicKey=${retrieveData.publicKey}`
    );
    const { data, status } = response;
    if (status >= 400) {
      throw new Error(data.message);
    }

    return response.data;
  },

  lookForL2Address: async (
    l2Check: ILookForL2Address
  ): Promise<ILookForL2AddressResponse> => {
    let requestUrl = `/nft/look-for-l2-address?to=${l2Check.to}`;
    if (l2Check.coinSymbol) requestUrl += `&coinSymbol=${l2Check.coinSymbol}`;
    const response = await axiosBase.get(requestUrl);
    const { data, status } = response;
    if (status >= 400) {
      throw new Error(data.message);
    }
    return response.data;
  },

  prepareL1Txn: async (
    transactionData: IWithdrawalProposal
  ): Promise<IPrepareL1TxnResponse> => {
    const response = await axiosBase.post(
      `/l1-txn-orchestrator/prepare-withdrawal`,
      JSON.stringify(transactionData)
    );
    const { data, status } = response;
    if (status >= 400) {
      throw new Error(data.message);
    }

    return response.data;
  },

  generateSecondaryOtk: async (
    signedReq: ICreateSecondaryOtk
  ): Promise<void> => {
    const response = await axiosBase.post(
      `/owner/generate-secondary-otk`,
      JSON.stringify(signedReq)
    );
    const { data, status } = response;
    if (status >= 400) {
      throw new Error(data);
    }
  },
};
