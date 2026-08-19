import crypto from 'crypto';

/**
 * Secure Password Hashing Service using Node.js crypto.scrypt
 * Zero third-party dependency, constant-time verification.
 */
export class PasswordService {
  private static readonly KEY_LEN = 64;

  /**
   * Hash password with unique salt
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, this.KEY_LEN);
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * Constant-time comparison of plaintext password against stored salt:hash
   */
  static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, this.KEY_LEN);

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }
}
