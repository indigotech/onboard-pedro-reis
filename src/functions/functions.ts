import * as crypto from 'crypto';

export function hashEncrypt (noEncrypted: string): string {
  return crypto.createHash('sha256').update(noEncrypted).digest('base64');
}
