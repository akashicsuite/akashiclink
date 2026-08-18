import { ACEnvironment } from '@akashic/nitr0gen';

export const getACEnv = (): ACEnvironment => {
  if (process.env.REACT_APP_ENV === 'prod') {
    return ACEnvironment.MAINNET;
  }
  if (process.env.REACT_APP_ENV === 'preprod') {
    return ACEnvironment.TESTNET;
  }
  return ACEnvironment.STAGING;
};
