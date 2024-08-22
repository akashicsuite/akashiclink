type ConversionDirection = 'to' | 'from';

const L2RegexWithOptionalPrefix = /^(AS)?[A-Fa-f\d]{64}$/;

/**
 * Ensures a UMID/L2-address has, or does not have, exactly one AS prefix.
 * i.e. it is idempotent.
 * @throws Error if the umid argument isn't a valid UMID/L2-address with or
 * without the prefix
 * @deprecated use {@link prefixWithAS} or {@link removeASPrefix} instead
 */
export function convertToFromASPrefix(
  umid: string,
  direction: ConversionDirection
): string {
  const result = L2RegexWithOptionalPrefix.exec(umid);
  if (!result)
    throw new Error(`${umid} does not match regex with or without prefix`);

  const hasPrefix = result[1];
  if (direction === 'to') {
    if (hasPrefix) return umid;
    return `AS${umid}`;
  } else {
    if (hasPrefix) return umid.slice(2);
    return umid;
  }
}

/**
 * Ensures a UMID/L2-address has exactly one AS prefix. i.e. it is idempotent.
 * @throws Error if the umid argument isn't a valid UMID/L2-address with or
 * without the prefix
 */
export function prefixWithAS<Umid extends string>(umid: Umid): `AS${Umid}` {
  const result = L2RegexWithOptionalPrefix.exec(umid);
  if (!result)
    throw new Error(`${umid} does not match regex with or without prefix`);

  if (result[1]) return umid as `AS${Umid}`;

  return `AS${umid}`;
}

/**
 * Ensures a UMID/L2-address doesn't have a AS prefix. i.e. it is idempotent.
 * @throws Error if the umid argument isn't a valid UMID/L2-address with or
 * without the prefix
 */
export function removeASPrefix(umid: string) {
  const result = L2RegexWithOptionalPrefix.exec(umid);
  if (!result)
    throw new Error(`${umid} does not match regex with or without prefix`);

  if (result[1]) return umid.slice(2);

  return umid;
}
