import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = (await scrypt(password, salt, keyLength)) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, encodedKey] = stored.split(':');
  if (!salt || !encodedKey) return false;
  const expected = Buffer.from(encodedKey, 'hex');
  const actual = (await scrypt(password, salt, keyLength)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
