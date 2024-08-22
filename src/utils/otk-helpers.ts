/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as asn1 from 'asn1.js';

// ASN Formats
const ECPrivASN = asn1.define('ECPrivASN', function () {
  this.seq().obj(
    // Version
    this.key('version').int(),
    // Root Key (Optional)
    this.key('privateKey').octstr().optional(),
    // Key Metadata (Optional)
    this.seq().optional().obj(),
    // OpenSSL Nested Key
    this.key('ECNested')
      .octstr()
      .optional()
      .contains(
        asn1.define('ECNested', function () {
          this.seq().obj(
            // Version
            this.key('version').int(),
            // Root Key
            this.key('privateKey').octstr()
          );
        })
      )
  );
});

const ECPubASN = asn1.define('ECPubASN', function () {
  this.seq().obj(
    this.key('algorithm')
      .optional()
      .seq()
      .obj(this.key('id').objid(), this.key('curve').objid()),
    this.key('publicKey').bitstr()
  );
});

// These functions help manage pem formats (and are not exposed in activecrypto)
function extractNestedKeys(asn: any, type = 'privateKey'): string {
  if (asn[type]) {
    if (asn[type].data) {
      return asn[type].data.toString('hex');
    } else {
      return asn[type].toString('hex');
    }
  } else {
    if (asn.ECNested) {
      return extractNestedKeys(asn.ECNested, type);
    } else {
      throw new Error('PPK not found inside ASN');
    }
  }
}

export function decodeECPrivateKey(
  pkcs8pem: string,
  label = 'EC PRIVATE KEY'
): string {
  return extractNestedKeys(
    ECPrivASN.decode(pkcs8pem, 'pem', {
      label: label,
      partial: true,
    }).result
  );
}

export function encodeECPublicKey(key: Buffer, label = 'PUBLIC KEY'): string {
  return ECPubASN.encode(
    {
      algorithm: {
        id: [1, 2, 840, 10045, 2, 1],
        curve: [1, 3, 132, 0, 10],
      },
      publicKey: {
        unused: 0,
        data: key,
      },
    },
    'pem',
    {
      label: label,
      partial: true,
    }
  );
}
