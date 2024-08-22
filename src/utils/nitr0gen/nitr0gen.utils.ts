import { CapacitorCookies } from '@capacitor/core';
import { otherError } from '@helium-pay/backend';
import axios from 'axios';

// enum Port {
//   CHAIN = '5260',
//   NFT = '8080',
// }

export enum PortType {
  CHAIN = 'general',
  NFT = 'nft',
}

export enum TestNodeKey {
  JP1 = 'JP1',
  SG1 = 'SG1',
  SG2 = 'SG2',
}

export enum ProductionNodeKey {
  JP1 = 'JP1',
  JP2 = 'JP2',
  SG1 = 'SG1',
  SG2 = 'SG2',
  HK1 = 'HK1',
  HK2 = 'HK2',
}

const ProductionChainNodes = {
  [ProductionNodeKey.JP1]: 'https://jp1.akashicchain.com/',
  [ProductionNodeKey.JP2]: 'https://jp2.akashicchain.com/',
  [ProductionNodeKey.SG1]: 'https://sg1.akashicchain.com/',
  [ProductionNodeKey.SG2]: 'https://sg2.akashicchain.com/',
  [ProductionNodeKey.HK1]: 'https://hk1.akashicchain.com/',
  [ProductionNodeKey.HK2]: 'https://hk2.akashicchain.com/',
};

const TestChainNodes = {
  [TestNodeKey.JP1]: 'https://jp1.testnet.akashicchain.com/',
  [TestNodeKey.SG1]: 'https://sg1.testnet.akashicchain.com/',
  [TestNodeKey.SG2]: 'https://sg2.testnet.akashicchain.com/',
};

const ProductionNFTNodes = {
  [ProductionNodeKey.JP1]: 'https://jp1-minigate.akashicchain.com/',
  [ProductionNodeKey.JP2]: 'https://jp2-minigate.akashicchain.com/',
  [ProductionNodeKey.SG1]: 'https://sg1-minigate.akashicchain.com/',
  [ProductionNodeKey.SG2]: 'https://sg2-minigate.akashicchain.com/',
  [ProductionNodeKey.HK1]: 'https://hk1-minigate.akashicchain.com/',
  [ProductionNodeKey.HK2]: 'https://hk2-minigate.akashicchain.com/',
};

const TestNFTNodes = {
  [TestNodeKey.JP1]: 'https://jp1-minigate.testnet.akashicchain.com/',
  [TestNodeKey.SG1]: 'https://sg1-minigate.testnet.akashicchain.com/',
  [TestNodeKey.SG2]: 'https://sg2-minigate.testnet.akashicchain.com/',
};

/**
 * Get a recommended amount of time to delay before re-sending a request to
 * Nitr0gen in the hope that it will succeed next time.
 * @param error the error object returned from Nitr0gen. It doesn't
 * technically need to be an {@link Error} object; a string will do.
 * @param attempts the number of failed attempts
 * @returns
 * - `null` if the error is non-transient. You shouldn't bother retrying these
 * - a number of milliseconds to wait before retrying the transaction, if the
 * error is known to be transient
 */
export function getRetryDelayInMS(error: string, attempts = 1) {
  switch (true) {
    case error.includes('Busy Locks'):
    case error.includes('Network Not Stable'):
    case error.includes('Failed to rebroadcast'):
    case error.includes('timeout'):
    case error.includes('status code 500'):
    case error === otherError.orderFailed:
      return 250;
    case error.includes('Stream Position Incorrect'):
    case error.includes('Stream(s) not found'):
      return 10_000 + 5_000 * (attempts - 1);
    default:
      return null;
  }
}

export async function chooseBestNodes(port: PortType) {
  const cookieMap = await CapacitorCookies.getCookies();

  if (cookieMap[`node-${port}`]) {
    return cookieMap[`node-${port}`];
  }

  const isProd = process.env.REACT_APP_ENV === 'prod';

  const nodeKey = await Promise.race(
    Object.entries(isProd ? ProductionNFTNodes : TestNFTNodes).map(
      async ([key, endpoint]) => {
        await axios.get(endpoint);
        return key;
      }
    )
  );

  let node: string;

  // use "if" to make typescript happy
  if (isProd) {
    node =
      port === PortType.CHAIN
        ? ProductionChainNodes[nodeKey as ProductionNodeKey]
        : ProductionNFTNodes[nodeKey as ProductionNodeKey];
  } else {
    node =
      port === PortType.CHAIN
        ? TestChainNodes[nodeKey as TestNodeKey]
        : TestNFTNodes[nodeKey as TestNodeKey];
  }

  await CapacitorCookies.setCookie({
    key: `node-${port}`,
    value: node,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toUTCString(), // 1 day
  });

  return node;
}

// Below is to replicate previous backend Nitr0gen error handling
// which is to make implementation of sendTransactionInsistently later easier
// TODO: refactor this with sendTransactionInsistently
// so that we don't need to declare HTTP error on frontend
export class BadGatewayException extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, BadGatewayException.prototype);
  }
}

export class NotFoundException extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

export class ForbiddenException extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}
