import type { IKeyExtended } from '@activeledger/sdk-bip39';
import type { CoinSymbol } from '@helium-pay/backend';

import { ALLOWED_NETWORKS } from '../constants/currencies';
import { Nitr0genApi } from './nitr0gen/nitr0gen-api';
import type { FullOtk } from './otk-generation';

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

export async function createL1Address(
  fullOtk: IKeyExtended,
  coinSymbol: CoinSymbol
): Promise<string | undefined> {
  // safeguard coinSymbol base on env
  if (!ALLOWED_NETWORKS.includes(coinSymbol)) {
    throw new Error('Coin not available');
  }

  const nitr0gen = new Nitr0genApi();

  const { address } = await nitr0gen.createKey(fullOtk, coinSymbol);

  return address;
}
