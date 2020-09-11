import * as crypto from 'crypto';

export function hashEncrypt (noEncrypted: string): string {
  const cipher = crypto.createCipher('aes128', 'a password');
  let encrypted = cipher.update(noEncrypted, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function hashDecrypt (encrypted: string): string {
  const decipher = crypto.createDecipher('aes128','a password');
  let decrypted = decipher.update(encrypted,'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
