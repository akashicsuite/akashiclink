import { PRESET_L2_ADDRESS } from '@helium-pay/api-mocks';

import type { FullOtk } from '../../../src/utils/otk-generation';

export const mockCacheOtk: FullOtk = {
  key: {
    prv: {
      pkcs8pem: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
    pub: {
      pkcs8pem: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
  },
  type: 'secp256k1',
  name: 'otk',
  identity: PRESET_L2_ADDRESS,
  phrase:
    'throw sausage rabbit alcohol useless memory resemble similar fancy clap witness time',
};
