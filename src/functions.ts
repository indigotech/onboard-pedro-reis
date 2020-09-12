import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { CustomError } from './errors';

export function hashEncrypt (noEncrypted: string): string {
  return crypto.createHash('sha256').update(noEncrypted).digest('base64');
}

export function verifyToken(token: string) {
  try {
    let tokenValidation = jwt.verify(token, 'supersecret');
    if (!tokenValidation.id){
      throw new Error;
    }
  } catch(err) {
    throw new CustomError('Usuário não autenticado! Faça seu login!', 401, 'invalid token');
  }
}
