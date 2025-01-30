import { CapacitorCookies } from '@capacitor/core';
import { otherError } from '@helium-pay/backend';
import axios from 'axios';

// enum Port {
//   CHAIN = '5260',
//   NFT = '8080',
// }
interface NodesPingInfo {
  key: string;
  ping: number;
}

export enum PortType {
  CHAIN = 'general',
  NFT = 'nft',
}

export enum TestNodeKey {
  JP1 = 'JP1',
  JP2 = 'JP2',
  SG1 = 'SG1',
  SG2 = 'SG2',
  HK1 = 'HK1',
  HK2 = 'HK2',
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
  [TestNodeKey.JP2]: 'https://jp2.testnet.akashicchain.com/',
  [TestNodeKey.SG1]: 'https://sg1.testnet.akashicchain.com/',
  [TestNodeKey.SG2]: 'https://sg2.testnet.akashicchain.com/',
  [TestNodeKey.HK1]: 'https://hk1.testnet.akashicchain.com/',
  [TestNodeKey.HK2]: 'https://hk2.testnet.akashicchain.com/',
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
  [TestNodeKey.JP2]: 'https://jp2-minigate.testnet.akashicchain.com/',
  [TestNodeKey.SG1]: 'https://sg1-minigate.testnet.akashicchain.com/',
  [TestNodeKey.SG2]: 'https://sg2-minigate.testnet.akashicchain.com/',
  [TestNodeKey.HK1]: 'https://hk1-minigate.testnet.akashicchain.com/',
  [TestNodeKey.HK2]: 'https://hk2-minigate.testnet.akashicchain.com/',
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

export async function getChainNode(port: PortType, node: string) {
  if (process.env.REACT_APP_ENV === 'prod') {
    return port === PortType.CHAIN
      ? ProductionChainNodes[node as ProductionNodeKey]
      : ProductionNFTNodes[node as ProductionNodeKey];
  } else {
    return port === PortType.CHAIN
      ? TestChainNodes[node as TestNodeKey]
      : TestNFTNodes[node as TestNodeKey];
  }
}

export async function chooseBestNodes(port: PortType) {
  const cookieMap = await CapacitorCookies.getCookies();
  if (cookieMap['preferred-node-key']) {
    return getChainNode(port, cookieMap['preferred-node-key']);
  }

  if (cookieMap[`node-${port}`]) {
    return cookieMap[`node-${port}`];
  }

  const isProd = process.env.REACT_APP_ENV === 'prod';
  const nodeKey = await Promise.any(
    Object.entries(isProd ? ProductionNFTNodes : TestNFTNodes).map(
      async ([key, endpoint]) => {
        await axios.get(endpoint);
        return key;
      }
    )
  );
  const node = await getChainNode(port, nodeKey);

  await CapacitorCookies.setCookie({
    key: `node-${port}`,
    value: node,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toUTCString(), // 1 day
  });

  return node;
}
export async function fetchNodesPing(
  hardRefresh: boolean
): Promise<NodesPingInfo[]> {
  const cookieMap = await CapacitorCookies.getCookies();
  if (!hardRefresh && cookieMap[`nodePingData`]) {
    return JSON.parse(cookieMap[`nodePingData`]) as NodesPingInfo[];
  }
  const isProd = process.env.REACT_APP_ENV === 'prod';
  const nodeEntries = Object.entries(
    isProd ? ProductionNFTNodes : TestNFTNodes
  );
  const nodePingData = await Promise.all(
    nodeEntries.map(async ([key, endpoint]) => {
      const start = Date.now();
      let ping;
      try {
        await axios.get(endpoint);
        ping = Date.now() - start;
      } catch {
        ping = 0; // Set default ping to be unreachable
      }
      return { key, ping };
    })
  );

  await CapacitorCookies.setCookie({
    key: `nodePingData`,
    value: JSON.stringify(nodePingData),
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toUTCString(), // 1 day
  });
  return nodePingData;
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
