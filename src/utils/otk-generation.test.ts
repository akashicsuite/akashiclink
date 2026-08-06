/// <reference types="vitest/globals" />
import { ActiveCrypto } from '@activeledger/activecrypto';

import type { FullOtk } from './otk-generation';
import {
  generateOTK,
  restoreOtkFromKeypair,
  verifyKeyHealth,
} from './otk-generation';

/**
 * Wraps a raw key pair into the minimal `FullOtk` shape that `verifyKeyHealth`
 * reads (only `key.prv` / `key.pub` matter for the health check).
 */
function asFullOtk(key: {
  prv: { pkcs8pem: string };
  pub: { pkcs8pem: string };
}): FullOtk {
  return {
    identity: 'AStest-identity',
    key,
    type: 'secp256k1',
    name: 'otk',
  } as FullOtk;
}

describe('verifyKeyHealth', () => {
  it('returns true for a freshly generated (PEM) OTK', async () => {
    const generated = await generateOTK();

    expect(verifyKeyHealth(asFullOtk(generated.key))).toBe(true);
  });

  it('returns true for an OTK restored from a hex (0x) key pair', () => {
    // Generate a raw secp256k1 key pair in 0x hex form, mirroring an imported
    // keypair account.
    const handler = new ActiveCrypto.KeyPair('secp256k1').generate(0, false);
    const restored = restoreOtkFromKeypair(handler.prv.pkcs8pem);

    expect(restored.key.prv.pkcs8pem.startsWith('0x')).toBe(true);
    expect(verifyKeyHealth(asFullOtk(restored.key))).toBe(true);
  });

  it('returns false when the public key does not match the private key', async () => {
    const otk = await generateOTK();
    const otherOtk = await generateOTK();

    // Valid, well-formed public key, but from a different key pair: the
    // signature cannot be verified against it.
    const mismatched = asFullOtk({
      prv: otk.key.prv,
      pub: otherOtk.key.pub,
    });

    expect(verifyKeyHealth(mismatched)).toBe(false);
  });

  it('returns false (does not throw) when signing fails on a malformed private key', () => {
    const broken = asFullOtk({
      prv: { pkcs8pem: 'not-a-real-private-key' },
      pub: { pkcs8pem: 'not-a-real-public-key' },
    });

    expect(() => verifyKeyHealth(broken)).not.toThrow();
    expect(verifyKeyHealth(broken)).toBe(false);
  });
});
