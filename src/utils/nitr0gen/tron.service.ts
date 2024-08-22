/* eslint-disable @typescript-eslint/no-explicit-any */
import { CoinSymbol } from '@helium-pay/backend';
import type { TronSymbol } from '@helium-pay/backend/src/modules/api-interfaces/coin-symbol.model';
import TronWeb from 'tronweb';

import type { ITronTransaction } from './tron.interface';

export const TronChainMetadata: { [key in TronSymbol]: string } = {
  [CoinSymbol.Tron]: 'https://api.trongrid.io',
  [CoinSymbol.Tron_Nile]: 'https://nile.trongrid.io/',
  [CoinSymbol.Tron_Shasta]: 'https://api.shasta.trongrid.io',
};

export const TRON_TRANSFER_FUNC = 'transfer(address,uint256)';

// TODO: Store this in env or smth
const apiKeys: { [key in TronSymbol]: string } = {
  [CoinSymbol.Tron]: 'key',
  [CoinSymbol.Tron_Nile]: 'key',
  [CoinSymbol.Tron_Shasta]: 'key',
};

/**
 * Class for working with Tron blockchain transactions
 *
 * Related : https://github.com/dsailtd/tron
 */
export class TronHelper {
  /**
   * Create raw transaction payload (Nitr0gen does direct signing for Tron)
   * NOTE: Tron transaction have a default expiry-time of 60s. We extend it by
   * 30s below, and with the current TX-checker cache TTL this is ok. However if
   * we extend that TTL, we must extend the expiration-time as well:
   * https://developers.tron.network/reference/extendexpiration
   */
  public async createNativeTransaction(
    to: string,
    from: string,
    amount: string,
    network: TronSymbol = CoinSymbol.Tron
  ): Promise<ITronTransaction> {
    const provider = this.getProvider(network);
    const transaction = await provider.transactionBuilder.sendTrx(
      to,
      amount,
      from
    );
    return await provider.transactionBuilder.extendExpiration(transaction, 30); // Extend by 30s
  }

  /**
   * Create a transaction payload (Nitr0gen does direct signing for Tron).
   * If {@link contractAddress} is specified, it will create a token
   * transaction payload
   */
  public async createTransaction(
    to: string,
    from: string,
    amount: string,
    network: TronSymbol = CoinSymbol.Tron,
    contractAddress?: string
  ): Promise<ITronTransaction> {
    if (!contractAddress)
      return await this.createNativeTransaction(to, from, amount, network);

    // Get provider with registered "owner"
    const provider = this.getProvider(network, from);

    // Get raw transaction for triggering a TRC20 transfer endpoint
    const tx = await provider.transactionBuilder.triggerSmartContract(
      contractAddress,
      TRON_TRANSFER_FUNC,
      {
        feeLimit: '40000000',
        callValue: 0,
      },
      [
        {
          type: 'address',
          value: to,
        },
        {
          type: 'uint256',
          value: amount,
        },
      ]
    );

    // Extend by 30s
    return await provider.transactionBuilder.extendExpiration(
      tx.transaction,
      30
    );
  }

  /**
   * Create provider object to trusted node host
   */
  private getProvider(network: TronSymbol, owner?: string): typeof TronWeb {
    const apiKey = apiKeys[network];
    const tronWeb = new TronWeb({
      fullNode: TronChainMetadata[network],
      solidityNode: TronChainMetadata[network],
      eventServer: TronChainMetadata[network],
      headers: {
        'TRON-PRO-API-KEY': apiKey,
      },
    });

    // Set owner address to provider instance
    if (owner) tronWeb.setAddress(owner);
    return tronWeb;
  }
}
