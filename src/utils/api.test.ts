/// <reference types="vitest/globals" />
import { OwnersAPI } from './api';
import { ChainAPI } from './chain-api';

const IDENTITY =
  'ASc5649f183badea7aca67db684a59904d7f7d6ce7e9dec550b9809005b2b96d96';
const PUBLIC_KEY =
  '0x03470895195f6221003f9d85bdd582827a103065bf0af0bcea3058d44cb6a61480';

describe('OwnersAPI.verifyOtkActive', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when the OTK is present in the identity authorities', async () => {
    vi.spyOn(ChainAPI, 'findIdentityStream').mockResolvedValue({
      umid: 'umid',
      authorities: [
        { public: PUBLIC_KEY, type: 'secp256k1', hash: 'hash', stake: 100 },
      ],
    });

    await expect(OwnersAPI.verifyOtkActive(IDENTITY, PUBLIC_KEY)).resolves.toBe(
      true
    );
  });

  it('returns false when the OTK is missing from the identity authorities (removed OTK)', async () => {
    vi.spyOn(ChainAPI, 'findIdentityStream').mockResolvedValue({
      umid: 'umid',
      authorities: [
        {
          public: '0xsomeOtherKey',
          type: 'secp256k1',
          hash: 'hash',
          stake: 100,
        },
      ],
    });

    await expect(OwnersAPI.verifyOtkActive(IDENTITY, PUBLIC_KEY)).resolves.toBe(
      false
    );
  });

  it('fails open (returns true) when the chain call errors out', async () => {
    vi.spyOn(ChainAPI, 'findIdentityStream').mockRejectedValue(
      new Error('Network Error')
    );

    await expect(OwnersAPI.verifyOtkActive(IDENTITY, PUBLIC_KEY)).resolves.toBe(
      true
    );
  });
});
