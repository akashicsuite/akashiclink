/* eslint-disable @typescript-eslint/no-explicit-any */
import { otherError } from '@helium-pay/backend';
import type {
  BinanceSymbol,
  EthereumSymbol,
} from '@helium-pay/backend/src/modules/api-interfaces/coin-symbol.model';
import { CoinSymbol } from '@helium-pay/backend/src/modules/api-interfaces/coin-symbol.model';
import { EtherscanProvider } from 'ethers';

/**
 * Ethereum Gas price structure
 */
export interface EthereumGasPrice {
  low: bigint;
  medium: bigint;
  high: bigint;
}

/**
 * Etherscan Gas Oracle info structure
 */
interface EthereumGasOracleInfo {
  LastBlock: string;
  SafeGasPrice: string;
  ProposeGasPrice: string;
  FastGasPrice: string;
  suggestBaseFee?: string; // Eth only
  gasUsedRatio?: string; // Eth only
  UsdPrice?: string; // BNB only
}

// GWei to Wei decimal (10 ** GWEI_DECIMAL);
export const GWEI_DECIMAL = 9;

// TODO: Store this in env or smth
const apiKeys: { [key in EthereumSymbol | BinanceSymbol]: string } = {
  [CoinSymbol.Ethereum_Mainnet]: 'key',
  [CoinSymbol.Ethereum_Sepolia]: 'key',
  [CoinSymbol.Binance_Smart_Chain_Mainnet]: 'key',
  [CoinSymbol.Binance_Smart_Chain_Testnet]: 'key',
};

interface IEthereumChainMetadata {
  chainId: number;
  balanceCheckerContract?: string;
}

export const EthereumChainMetadata: {
  [key in EthereumSymbol | BinanceSymbol]: IEthereumChainMetadata;
} = {
  [CoinSymbol.Ethereum_Mainnet]: {
    chainId: 1,
    balanceCheckerContract: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
  },
  [CoinSymbol.Ethereum_Sepolia]: {
    chainId: 11155111,
    balanceCheckerContract: '0xa5C98f48A9d35CDd49a37440669C37c366e791e6',
  },
  [CoinSymbol.Binance_Smart_Chain_Mainnet]: {
    chainId: 56,
    balanceCheckerContract: '0x2352c63A83f9Fd126af8676146721Fa00924d7e4',
  },
  [CoinSymbol.Binance_Smart_Chain_Testnet]: {
    chainId: 97,
    balanceCheckerContract: '0x2352c63A83f9Fd126af8676146721Fa00924d7e4',
  },
  // TODO: Uncomment when US2 has been supported
  // [CoinSymbol.US2]: 1517,
};

/**
 * Class for interacting with live Ethereum Blockchain
 */
export class EthereumHelper {
  /**
   * Queries the number of transactions so far for the given address
   *
   * @param address
   * @param network
   * @returns The nonce of the address
   */
  public async getTransactionCount(
    address: string,
    network: EthereumSymbol | BinanceSymbol = CoinSymbol.Ethereum_Mainnet
  ): Promise<number> {
    const provider = this.getProvider(network);
    return (await provider.getTransactionCount(address, 'pending')) || 0;
  }

  /**
   * Fetch current gas fees on Ethereum network, Default to medium
   * Etherscan provides API call to gas oracles for mainnets, but not for testnets don't
   * This function is cached with TTL 15s
   */
  public async getGasFee(
    network: EthereumSymbol | BinanceSymbol = CoinSymbol.Ethereum_Mainnet
  ): Promise<EthereumGasPrice> {
    const provider = this.getProvider(network);
    let baseFee: bigint, oracleInfo: EthereumGasOracleInfo;
    switch (network) {
      case CoinSymbol.Ethereum_Mainnet:
      case CoinSymbol.Binance_Smart_Chain_Mainnet:
        oracleInfo = await provider.fetch('gastracker', {
          action: 'gasoracle',
        });
        return {
          // convert from GWei to Wei
          low:
            BigInt(10) ** BigInt(GWEI_DECIMAL) *
            BigInt(oracleInfo.SafeGasPrice),
          medium:
            BigInt(10) ** BigInt(GWEI_DECIMAL) *
            BigInt(oracleInfo.ProposeGasPrice),
          high:
            BigInt(10) ** BigInt(GWEI_DECIMAL) *
            BigInt(oracleInfo.FastGasPrice),
        };
      case CoinSymbol.Ethereum_Sepolia:
      case CoinSymbol.Binance_Smart_Chain_Testnet:
        baseFee = (await provider.getFeeData()).maxFeePerGas ?? BigInt(0);

        return {
          // Inaccurate guess at current gas prices - doesn't matter much since it's testnets
          // note: tried adding a tip of 1, 2 or 3 GWei, but transaction times became quite slow
          low: (baseFee * BigInt(11)) / BigInt(10),
          medium: (baseFee * BigInt(13)) / BigInt(10),
          high: (baseFee * BigInt(15)) / BigInt(10),
        };
      default:
        throw new Error(otherError.unsupportedCoinError);
    }
  }

  /**
   * Create provider object to trusted node host
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  private getProvider(
    network: EthereumSymbol | BinanceSymbol
  ): EtherscanProvider {
    const apiKey = apiKeys[network];
    switch (network) {
      default:
        throw new Error(`${network} not yet supported`);
      case CoinSymbol.Ethereum_Mainnet:
        return new EtherscanProvider('mainnet', apiKey);
      case CoinSymbol.Binance_Smart_Chain_Mainnet:
        return new EtherscanProvider('bnb', apiKey);
      case CoinSymbol.Binance_Smart_Chain_Testnet:
        return new EtherscanProvider('bnbt');
      case CoinSymbol.Ethereum_Sepolia:
        return new EtherscanProvider('sepolia', apiKey);
    }
  }
}
