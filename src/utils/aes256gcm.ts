import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const GCM_PREFIX = 'gcm:';

const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// key min length is 32 byte
export const genGcmKeyFromPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest();
};

export const encryptGcmWithPassword = (otk: string, password: string) => {
  const iv = crypto.randomBytes(12);
  const key = genGcmKeyFromPassword(password);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(otk, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return (
    GCM_PREFIX + Buffer.concat([iv, authTag, encrypted]).toString('base64')
  );
};

export const decryptGcmWithPassword = (encrypted: string, password: string) => {
  const key = genGcmKeyFromPassword(password);

  // remove GCM_PREFIX
  const encryptedDataPair = Buffer.from(
    encrypted.replace(GCM_PREFIX, ''),
    'base64'
  );

  //extract iv and authTag
  const iv = encryptedDataPair.subarray(0, IV_LENGTH);
  const authTag = encryptedDataPair.subarray(
    IV_LENGTH,
    IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encryptedOtk = encryptedDataPair.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encryptedOtk),
    decipher.final(),
  ]).toString('utf8');
};
