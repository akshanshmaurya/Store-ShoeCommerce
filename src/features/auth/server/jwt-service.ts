import crypto from 'crypto';

interface JWTPayload {
  userId: string;
  email: string;
  exp: number; // Unix timestamp in seconds
}

export class JWTService {
  private static readonly SECRET = process.env.AUTH_SECRET || 'veloce-storefront-auth-jwt-secret-key-2026';
  private static readonly EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private static base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf8');
  }

  /**
   * Sign payload into JWT string
   */
  static sign(userId: string, email: string): { token: string; expiresAt: string } {
    const header = { alg: 'HS256', typ: 'JWT' };
    const exp = Math.floor(Date.now() / 1000) + this.EXPIRY_SECONDS;
    const payload: JWTPayload = { userId, email, exp };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = crypto
      .createHmac('sha256', this.SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const token = `${encodedHeader}.${encodedPayload}.${signature}`;
    const expiresAt = new Date(exp * 1000).toISOString();

    return { token, expiresAt };
  }

  /**
   * Verify token and return payload if valid and unexpired
   */
  static verify(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;

      const expectedSignature = crypto
        .createHmac('sha256', this.SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null;
      }

      const payload: JWTPayload = JSON.parse(this.base64UrlDecode(encodedPayload));
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (payload.exp < currentTimestamp) {
        return null; // Expired
      }

      return payload;
    } catch {
      return null;
    }
  }
}
