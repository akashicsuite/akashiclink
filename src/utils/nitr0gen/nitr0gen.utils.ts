import {
  ACEnvironment,
  createNitr0genUrl,
  getFastestNodeKey,
  getNodes,
  Nitr0genApi,
} from '@akashic/nitr0gen';
import Cookies from 'js-cookie';

import { FASTEST_NODE_KEY, PREFERRED_NODE_KEY } from '../cookies-keys';

let nitr0genApiInstance: Nitr0genApi | null = null;

export async function getNitr0genApi(): Promise<Nitr0genApi> {
  if (!nitr0genApiInstance) {
    nitr0genApiInstance = new Nitr0genApi({
      environment:
        process.env.REACT_APP_ENV === 'prod'
          ? ACEnvironment.MAINNET
          : process.env.REACT_APP_ENV === 'preprod'
            ? ACEnvironment.TESTNET
            : ACEnvironment.STAGING,
      dbIndex: parseInt(process.env.REACT_APP_REDIS_DB_INDEX!, 10),
      // Resolved live on every operation. undefined = Auto (nitr0gen picks the
      // fastest reachable node from its cached pings).
      getPreferredNodeKey: () => Cookies.get(PREFERRED_NODE_KEY) || undefined,
      needServerTime: true,
    });
  }
  return nitr0genApiInstance;
}

export async function chooseBestNodesFromCookies(
  nodeEntry: 'general' | 'minigate'
) {
  const node = getNodes(
    process.env.REACT_APP_ENV === 'prod'
      ? ACEnvironment.MAINNET
      : process.env.REACT_APP_ENV === 'preprod'
        ? ACEnvironment.TESTNET
        : ACEnvironment.STAGING
  );
  const preferredNode = Cookies.get(PREFERRED_NODE_KEY);

  if (preferredNode) {
    return createNitr0genUrl(node[preferredNode], nodeEntry);
  }

  const fastestNode = Cookies.get(FASTEST_NODE_KEY);
  if (fastestNode) {
    return createNitr0genUrl(node[fastestNode], nodeEntry);
  }

  const nodeKey = await getFastestNodeKey(
    process.env.REACT_APP_ENV === 'prod'
      ? ACEnvironment.MAINNET
      : process.env.REACT_APP_ENV === 'preprod'
        ? ACEnvironment.TESTNET
        : ACEnvironment.STAGING
  );

  Cookies.set(FASTEST_NODE_KEY, nodeKey, {
    expires: 1, // 1 day
  });

  return createNitr0genUrl(node[nodeKey], nodeEntry);
}
