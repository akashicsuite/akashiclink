import { TransactionHandler } from '@activeledger/sdk';
import type { IKeyExtended } from '@activeledger/sdk-bip39';
import { datadogRum } from '@datadog/browser-rum';
import type {
  CurrencySymbol,
  IBaseTransactionWithDbIndex,
  ITerriTransaction,
} from '@helium-pay/backend';
import {
  CoinSymbol,
  keyError,
  NetworkDictionary,
  otherError,
} from '@helium-pay/backend';
import axios from 'axios';

import { convertToFromASPrefix } from '../convert-as-prefix';
import { EthereumChainMetadata, EthereumHelper } from './ethereum.service';
import type {
  ActiveLedgerResponse,
  IKeyCreationResponse,
  IOnboardedIdentity,
  L1TxDetail,
  L2TxDetail,
  Nitr0EthereumTrxSignature,
  Nitr0TronTrxSignature,
  TransactionSignature,
} from './nitr0gen.interface';
import {
  BadGatewayException,
  chooseBestNodes,
  ForbiddenException,
  getRetryDelayInMS,
  NotFoundException,
  PortType,
} from './nitr0gen.utils';
import { TronHelper } from './tron.service';

// Used to index nitr0gen responses when getting info for native coin
export const nitr0genNativeCoin = '#native';

enum ProductionContracts {
  Namespace = 'notabox.keys',
  Create = 'c278818b9f10d5f18381a711827e344d583f7ecf446cdfb4b92016b308838a72@3.0.6', // Only supports trx, eth, bnb + testnets
  CryptoTransfer = 'a48df2fd31400a9b69d9b8bdb699618faed2999ca08c559695a4b74597d3e895@3.0.5',
  DiffConsensus = 'a9711259f9c0322c6eb1cca4c0baf1b460266be79c5c0f78cf1602a8476e0744@3.0.1',
  Onboard = 'df9e4e242c58cc6a03ca1679f007c7a04cad72c97fdb74bdfe9a4e1688077a79@1.5.0',
  NFTNamespace = 'candypig',
  NFTTransfer = '52e8ec2faef459da41fc4ed669644b4f07639bfdd871081763517e92973d3623@1.0.5',
  // Prod-contract has a 72 hr time restriction on re-linking AAS. The other
  // contract is equivalent but has only 60s for easy testing
  NFTAcnsRecord = '29a20530ecc5f835ceb55bb1f27a329f5ac8126f53630ce79535675af0f2f184@1.0.2',
  NFTAcnsRecordTesting = 'c7030a072163854c0c3890318694f8fa8f271ba2675554370d2029ad054cfe18@1.0.1',
}

enum TestNetContracts {
  Namespace = 'akashic',
  Create = 'c4f1186c58f49db2fdba401a1b36832902325d11a2e69ac6ef800836274c6894@5.1.4',
  CryptoTransfer = 'd1903e29ea83413ecc759d129f7a21e4f8039ac5650360cf83d993343b5ffaa6@5.1.21',
  DiffConsensus = '76869d5f632c283324b0cb7c8e16ba14eec2cf5d6d7b3f4521cc9b6a12818623@3.0.3',
  Onboard = 'b089a212ac22f57e2bef7d8a7f25702ebda98173939be2eba1ac0c2523d77383@5.0.3',
  NFTNamespace = 'candypig',
  NFTTransfer = '9c6ce3ed0c1e669471cd72ad9a81ea6ad13b6c3ba18b3ca05281fa721903f0e0@1.0.8',
  NFTAcnsRecord = '4efd09f16b5c50ac95aeddcd36852d52eca0cf59e46dda39607e872b298dbefb@1.0.5',
  NFTAcnsRecordTesting = '48192d7629e1b42772b9a4b87974e24c7d7c7225346e7dc9cbe74acb311a29db@1.0.2',
}

const Nitr0gen =
  process.env.REACT_APP_ENV === 'prod' ? ProductionContracts : TestNetContracts;

export async function signTxBody<T extends IBaseTransactionWithDbIndex>(
  txBody: T,
  otk: IKeyExtended
): Promise<T> {
  const txHandler = new TransactionHandler();
  if (process.env.REACT_APP_ENV !== 'prod') {
    if (!process.env.REACT_APP_REDIS_DB_INDEX) {
      throw new Error(
        'You must specify the variable `REACT_APP_REDIS_DB_INDEX` in your AW .env file or you will clobber staging!'
      );
    }
    txBody.$tx._dbIndex = parseInt(process.env.REACT_APP_REDIS_DB_INDEX);
  }

  return await txHandler.signTransaction(txBody, otk);
}

/**
 * Class implements basic interactions with the Nitr0gen network
 */
export class Nitr0genApi {
  private ethereum = new EthereumHelper();
  private tron = new TronHelper();

  public async onboardOtk(otk: IKeyExtended): Promise<IOnboardedIdentity> {
    const tx = await this.onboardOtkTransaction(otk);
    const response = await this.post<ActiveLedgerResponse>(tx);

    const ledgerId = response.$streams.new?.[0].id;
    if (!ledgerId) {
      throw new Error('Failed to generate identity for OTK');
    }
    // Convert ledgerId to include AS-prefix used in Akashic
    return { ledgerId: convertToFromASPrefix(ledgerId, 'to') };
  }

  public async createKey(otk: IKeyExtended, coinSymbol: CoinSymbol) {
    const tx = await this.keyCreateTransaction(
      otk,
      NetworkDictionary[coinSymbol].nitr0genSymbol,
      NetworkDictionary[coinSymbol].nitr0genNetwork
    );
    const response = await this.post<
      ActiveLedgerResponse<IKeyCreationResponse>
    >(tx);

    const newKey = response.$responses?.[0];
    if (!newKey) {
      throw new Error('Failed to generate new key');
    }

    // Run differential consensus checks
    const txBody = await this.differentialConsensusTransaction(otk, newKey);
    const diffResponse = await this.post<ActiveLedgerResponse>(txBody);

    // Check for confirmation of consensus call
    if (diffResponse.$responses && diffResponse.$responses[0] !== 'confirmed') {
      throw new Error(
        `Key Generation Failed on DiffCon (UMID:${diffResponse.$umid})`
      );
    }

    return {
      ledgerId: convertToFromASPrefix(newKey.id, 'to'),
      address: newKey.address,
      hashes: newKey.hashes,
    };
  }

  protected async createNitr0genUrl(
    port: PortType,
    path?: string
  ): Promise<string> {
    // TODO: Replace with user-stored selected node
    let NITR0_URL = await chooseBestNodes(port);

    if (path) {
      NITR0_URL += `/${path}`;
    }
    return NITR0_URL;
  }

  /**
   * Helper method to send get or post-requests to a Nitr0gen Gateway
   * TODO: For now, prod uses the gateway with API key,
   *  while staging goes directly to a node.
   *  When Prod also moves to direct, can remove `headers` and the conditional safe-making
   */
  private async send<T>(
    tx?: object,
    path?: string,
    port: PortType = PortType.CHAIN,
    method: 'get' | 'post' = 'post',
    timeout = 5000
  ): Promise<T> {
    const NITR0_URL = await this.createNitr0genUrl(port, path);

    try {
      const requestFunction = method === 'post' ? axios.post : axios.get;

      const response = await requestFunction(NITR0_URL, tx, {
        ...(method === 'get' ? { timeout } : {}),
      });

      // Prefix "AS" to umids so that "L2-hashes" have the prefix
      if (response.data.$umid) {
        response.data.$umid = 'AS' + response.data.$umid;
      }

      return response.data;
    } catch (e: unknown) {
      console.error(e);
      throw e;
      // TODO: Handle error with retry-logic in-app
    }
  }

  /**
   * Helper method to send commands to a Nitr0gen Gateway
   */
  public async post<T>(
    tx: object,
    path?: string,
    port: PortType = PortType.CHAIN
  ): Promise<T> {
    return await this.send(tx, path, port);
  }

  /**
   * Helper method to get from Nitr0gen Gateway
   * @param timeout time in milliseconds
   * @param port port type
   */
  public async get<T>(
    path: string,
    port: PortType = PortType.CHAIN,
    timeout = 5000
  ): Promise<T> {
    return await this.send(undefined, path, port, 'get', timeout);
  }

  /**
   * Transaction to onboard otk to nitr0gen, giving it an identity
   */
  public async onboardOtkTransaction(
    otk: IKeyExtended
  ): Promise<IBaseTransactionWithDbIndex> {
    const txBody: IBaseTransactionWithDbIndex = {
      $tx: {
        $namespace: Nitr0gen.Namespace,
        $contract: Nitr0gen.Onboard,
        $i: {
          otk: {
            publicKey: otk.key.pub.pkcs8pem,
            type: otk.type,
          },
        },
      },
      $sigs: {},
      $selfsign: true,
    };

    // Sign Transaction
    return await signTxBody(txBody, otk);
  }

  /**
   * Transaction to create a key for the requested coinSymbol
   *
   * Dev-info: relevant response in `response.responses[0]` as `IKeyCreationResponse`
   */
  async keyCreateTransaction(
    otk: IKeyExtended,
    coinSymbol: string,
    network: string
  ): Promise<IBaseTransactionWithDbIndex> {
    // Build Transaction
    const txBody: IBaseTransactionWithDbIndex = {
      $tx: {
        $namespace: Nitr0gen.Namespace,
        $contract: Nitr0gen.Create,
        $i: {
          owner: {
            $stream: otk.identity,
            symbol: coinSymbol.toLowerCase(),
            network,
          },
        },
      },
      $sigs: {},
    };
    // Sign Transaction
    return await signTxBody(txBody, otk);
  }

  /**
   * Differential consensus transaction to ensure a newly created key is secured
   *
   * Dev-info: relevant response in `response.responses[0]` as `string`.
   * Should be `'confirmed'`, anything else means key is broken
   */
  async differentialConsensusTransaction(
    otk: IKeyExtended,
    key: IKeyCreationResponse
  ): Promise<IBaseTransactionWithDbIndex> {
    // Build Transaction
    const txBody: IBaseTransactionWithDbIndex = {
      $tx: {
        $namespace: Nitr0gen.Namespace,
        $contract: Nitr0gen.DiffConsensus,
        $i: {
          owner: {
            $stream: otk.identity,
            address: key.address,
            hashes: key.hashes,
          },
        },
        $o: {
          key: {
            $stream: key.id,
          },
        },
      },
      $sigs: {},
    };

    // Sign Transaction
    return await signTxBody(txBody, otk);
  }

  /**
   * L1 transaction from Nitr0gen where wallet has funds registered to L2
   * If a non-root owner is sending L1, need a ledgerId of a key on the same
   * network owned as root by the sender
   *
   */
  async L2ToL1SignTransaction(
    otk: IKeyExtended,
    keyLedgerId: string,
    network: CoinSymbol,
    amount: string,
    transaction: TransactionSignature,
    token?: CurrencySymbol
  ): Promise<IBaseTransactionWithDbIndex> {
    // Build Transaction
    const txDetail: L1TxDetail = {
      amount,
    };

    // Used by Tron transactions
    if ('hex' in transaction) {
      txDetail['hex'] = transaction.hex;
    }

    // Used by ETH/BNB transactions
    if ('nonce' in transaction) {
      txDetail['nonce'] = transaction.nonce;
    }
    const $o: { [keyLedgerId: string]: L1TxDetail } = {};

    $o[keyLedgerId] = txDetail;

    const txBody: IBaseTransactionWithDbIndex = {
      $tx: {
        $namespace: Nitr0gen.Namespace,
        $contract: Nitr0gen.CryptoTransfer,
        $entry: 'sign',
        $i: {
          owner: {
            $stream: otk.identity,
            network,
            token: token ?? nitr0genNativeCoin,
            amount,
            signtx: transaction,
          },
        },
        $o,
      },
      $sigs: {},
    };

    // Sign Transaction
    return await signTxBody(txBody, otk);
  }

  /**
   * L2 transaction between two users
   *
   * Dev-info: Relevant return is response.$umid (which is the "l2-hash")
   */
  async L2Transaction(
    otk: IKeyExtended,
    details: L2TxDetail
  ): Promise<IBaseTransactionWithDbIndex> {
    const $i = {
      owner: {
        $stream: otk.identity,
        network: details.coinSymbol,
        token: details.tokenSymbol ?? nitr0genNativeCoin,
        amount: details.amount,
      },
    };

    const txBody: IBaseTransactionWithDbIndex = {
      $tx: {
        $namespace: Nitr0gen.Namespace,
        $contract: Nitr0gen.CryptoTransfer,
        $entry: 'transfer',
        $i,
        $o: {
          to: { $stream: details.toAddress },
        },
        metadata: {
          initiatedToNonL2: details.initiatedToNonL2,
        },
      },
      $sigs: {},
    };
    // Sign Transaction
    return await signTxBody(txBody, otk);
  }

  /**
   * Link/unlink AAS transaction
   */
  async aasSwitchTransaction(
    otk: IKeyExtended,
    acnsStreamId: string,
    recordType: string,
    recordKey: string,
    value?: string
  ): Promise<IBaseTransactionWithDbIndex> {
    const txBody: IBaseTransactionWithDbIndex = {
      $sigs: {},
      $tx: {
        $namespace: Nitr0gen.NFTNamespace,
        $contract:
          process.env.REACT_APP_ENV === 'prod'
            ? Nitr0gen.NFTAcnsRecord
            : Nitr0gen.NFTAcnsRecordTesting,
        $i: {
          nft: {
            $stream: acnsStreamId,
            recordType: recordType,
            recordName: recordKey,
            recordValue: value,
          },
        },
      },
    };
    // Sign Transaction
    // "Hack" used when signing nft transactions, identity must be something else than the otk identity

    return await signTxBody(txBody, {
      ...otk,
      identity: acnsStreamId,
    });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public async sendSignedTx<ResponseT = any>(
    signedTx: IBaseTransactionWithDbIndex | ITerriTransaction
  ): Promise<ActiveLedgerResponse<ResponseT>> {
    return await this.post<ActiveLedgerResponse<ResponseT>>(signedTx);
  }

  /**
   * NFT transaction between two users
   */
  public async transferNftTransaction(
    otk: IKeyExtended,
    acnsStreamId: string,
    newOwnerIdentity: string
  ): Promise<IBaseTransactionWithDbIndex> {
    // Build Transaction
    const txBody: IBaseTransactionWithDbIndex = {
      $tx: {
        $namespace: Nitr0gen.NFTNamespace,
        $contract: Nitr0gen.NFTTransfer,
        $i: {
          nft: {
            $stream: acnsStreamId,
          },
        },
        $o: {
          owner: {
            $stream: newOwnerIdentity,
          },
        },
      },
      $sigs: {},
    };
    // Sign Transaction
    // "Hack" used when signing nft transactions, identity must be something else than the otk identity
    return await signTxBody(txBody, {
      ...otk,
      identity: acnsStreamId,
    });
  }

  /**
   * Constructs an L1 transaction
   * Use if backend is down to create an L1-transaction directly
   */
  public async constructL1TransactionObject(
    coinSymbol: CoinSymbol,
    amount: string,
    toAddress: string,
    fromAddress: string,
    tokenContract?: string
  ): Promise<Nitr0TronTrxSignature | Nitr0EthereumTrxSignature> {
    switch (coinSymbol) {
      case CoinSymbol.Ethereum_Mainnet:
      case CoinSymbol.Ethereum_Sepolia:
      case CoinSymbol.Binance_Smart_Chain_Mainnet:
      case CoinSymbol.Binance_Smart_Chain_Testnet:
        return {
          to: toAddress,
          from: fromAddress,
          nonce: await this.ethereum.getTransactionCount(
            fromAddress,
            coinSymbol
          ),
          gas:
            '0x' +
            (await this.ethereum.getGasFee(coinSymbol))['medium'].toString(16), // gas price
          chainId: EthereumChainMetadata[coinSymbol].chainId,
          // ERC20 token or ETH transfer, amounts in hexadecimal
          amount: '0x' + BigInt(amount).toString(16),
          contractAddress: tokenContract,
        };
      case CoinSymbol.Tron:
      case CoinSymbol.Tron_Nile:
      case CoinSymbol.Tron_Shasta:
        return {
          to: toAddress,
          amount,
          hex: await this.tron.createTransaction(
            toAddress,
            fromAddress,
            amount,
            coinSymbol,
            tokenContract
          ),
        };
      default:
        throw new Error(otherError.unsupportedCoinError);
    }
  }

  /**
   * Helper to check responses from nitr0gen for errors and determine whether
   * they are transient or permanent.
   * ActiveLedger is set up to proceed even if a minority of nodes error.
   * This method logs non-fatal errors.
   *
   * @throws BadGatewayException if the result returned an error judged to be
   * transient
   * @throws Error if the result returned an error judged to be permanent
   */
  public checkForNitr0genError(response: ActiveLedgerResponse): void {
    if (response.$summary.commit) {
      if (response.$summary.errors?.length)
        this.logErroredNitr0genResponse(response, 'log');
      return;
    }

    // Sort error by associated delay in retrying, high to low.
    // i.e. from "most permanent" to "most transient"
    const errors = (response.$summary.errors ?? [])
      .map((e) => [e, getRetryDelayInMS(e)] as const)
      .sort(([_a, a], [_b, b]) => (b ?? Infinity) - (a ?? Infinity));

    // if we got a permanent error and no yes-votes, retrying is pointless
    const permanentError = errors.find(([_e, retry]) => retry == null);
    if (permanentError && errors.length >= response.$summary.vote) {
      this.logErroredNitr0genResponse(response, 'error');
      this.convertChainErrorToAPIError(permanentError[0]);
    }

    // special case: this error can be transient, but if there's unanimity then it's permanent
    if (
      errors.every(([e]) => e.includes('Stream(s) not found')) &&
      errors.length >= response.$summary.vote
    ) {
      this.logErroredNitr0genResponse(response, 'error');
      throw new NotFoundException(keyError.invalidL2Address);
    }

    const worstTransientError = errors.find(([_e, delay]) => delay != null);
    this.logErroredNitr0genResponse(response, 'warn');
    throw new BadGatewayException(
      worstTransientError?.[0] ?? otherError.orderFailed
    );
  }

  /**
   * Interprets Nitr0gen's cryptic errors and throws the most appropriate coded
   * error for which we have i18n.
   * @param error the error-string returned from Nitr0gen
   * @throws
   */
  private convertChainErrorToAPIError(error: string): never {
    switch (true) {
      case this.isChainErrorSavingsExceeded(error):
        throw new ForbiddenException(keyError.savingsExceeded);
      case String(error).includes('Stream(s) not found'):
        throw new NotFoundException(keyError.invalidL2Address);
      case this.isChainErrorTransient(error):
        throw new BadGatewayException(otherError.orderFailed);
      default:
        throw new Error(otherError.orderFailed, { cause: error });
    }
  }

  private isChainErrorTransient(error: string) {
    return !!getRetryDelayInMS(error);
  }

  private isChainErrorSavingsExceeded(error: string) {
    return [
      'balance is not sufficient',
      "Couldn't parse integer",
      'Part-Balance to low',
    ].some((msg) => String(error).includes(msg));
  }

  private logErroredNitr0genResponse(
    response: ActiveLedgerResponse,
    logLevel: 'log' | 'warn' | 'error' = 'error'
  ): void {
    const errorMessage = `[${logLevel}] Nitr0gen error: ${JSON.stringify(
      response.$summary.errors
    )}`;
    // addError without initiating Error
    // such that it just log and not triggering error on Datadog
    datadogRum.addError(
      logLevel === 'error' ? new Error(errorMessage) : errorMessage
    );
  }

  /**
   * TODO: Handle insistent calling to nitr0gen if transilient error
   */
  public async sendTransaction<ReturnT>(
    nitr0ApiFn: () => Promise<ActiveLedgerResponse<ReturnT>>
  ) {
    const nitr0genApi = new Nitr0genApi();
    const alResponse = await nitr0ApiFn();

    nitr0genApi.checkForNitr0genError(alResponse);

    return alResponse;
  }
}
