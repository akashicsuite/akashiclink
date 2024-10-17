import { datadogRum } from '@datadog/browser-rum';

import { OwnersAPI } from '../api';
import { Nitr0genApi } from '../nitr0gen/nitr0gen-api';
import { type FullOtk, generateOTK } from '../otk-generation';
import { unpackRequestErrorMessage } from '../unpack-request-error-message';
import { useAccountMe } from './useAccountMe';
import { useAccountStorage } from './useLocalAccounts';

type OldPubKeyPayload = { oldPubKeyToRemove?: string };

export const useGenerateSecondaryOtk = () => {
  const { activeAccount } = useAccountStorage();
  const { data: account } = useAccountMe();
  const { cacheOtk } = useAccountStorage();

  return async (payload: OldPubKeyPayload) => {
    try {
      if (!cacheOtk || !activeAccount || !account) {
        throw new Error('CouldNotReadAddress');
      }
      const nitr0gen = new Nitr0genApi();

      // generate a new otk
      const secondaryOtk = (await generateOTK()) as FullOtk;

      const signedTx = await nitr0gen.secondaryOtkTransaction(
        // @ts-ignore
        cacheOtk,
        secondaryOtk.key.pub.pkcs8pem,
        payload.oldPubKeyToRemove
      );

      await OwnersAPI.generateSecondaryOtk({ signedTx });

      return `0x${secondaryOtk.key.prv.pkcs8pem}-${secondaryOtk.key.pub.pkcs8pem}`;

      // return the new private key to frontend
    } catch (e: unknown) {
      const error = e as Error;

      datadogRum.addError(error);

      // Special return in case assigning the new OTK fails. Used to prompt a message on AP to retry
      return `0xERROR-${
        error.message === 'CouldNotReadAddress'
          ? 'CouldNotReadAddress'
          : unpackRequestErrorMessage(error)
      }`;
    }
  };
};
