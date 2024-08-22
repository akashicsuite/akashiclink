import type { IKeyExtended } from '@activeledger/sdk-bip39';

import { ALLOWED_NETWORKS } from '../../constants/currencies';
import { Nitr0genApi } from '../../utils/nitr0gen/nitr0gen-api';
import type { FullOtk } from '../../utils/otk-generation';

export async function createAccountWithKeys(
  otk: IKeyExtended
): Promise<{ otk: FullOtk }> {
  const nitr0gen = new Nitr0genApi();

  // 1. Request account-creation
  const { ledgerId } = await nitr0gen.onboardOtk(otk);

  const fullOtk = { ...otk, identity: ledgerId };

  // mainnets for production accounts and testnets for staging and local accounts
  const allowedChains = ALLOWED_NETWORKS;

  // Loop through chains, for each create a transaction for a new key to be
  // signed by frontend
  for (const coinSymbol of allowedChains) {
    await nitr0gen.createKey(fullOtk, coinSymbol);
  }

  return { otk: fullOtk };
}
