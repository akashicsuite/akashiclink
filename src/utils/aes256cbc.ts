import crypto from 'crypto';

// Legacy CBC constants — kept only for decrypting pre-GCM stored OTKs
const CBC_ALGO = 'aes-256-cbc';
const secretIv = process.env.REACT_APP_SECRETIV ?? '6RxIESTJ1eJLpjpe';

//Legacy CBC key generation SHOULD NOT BE USED FOR NEW STUFF

export const genLegacyCbcKey = (password: string) =>
  crypto.createHash('sha256').update(password).digest('hex').substring(0, 32);

export const decryptLegacyCbcWithPassword = (
  encryptedOtk: string,
  password: string
) => {
  const encryptedOtkBuff = Buffer.from(encryptedOtk, 'base64');
  const key = genLegacyCbcKey(password);
  const decipher = crypto.createDecipheriv(CBC_ALGO, key, secretIv);
  return (
    decipher.update(encryptedOtkBuff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')
  );
};
