/**
 * In-Memory Sliding-Window Rate Limiter
 * Provides protection against credential stuffing, brute-force logins, and registration spam.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, record] of entries) {
      record.timestamps = record.timestamps.filter((ts: number) => now - ts < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  /**
   * Check if an action is allowed for a given identifier
   */
  static isAllowed(identifier: string, config: RateLimitConfig): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let record = rateLimitStore.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      rateLimitStore.set(identifier, record);
    }

    record.timestamps = record.timestamps.filter((ts: number) => ts > windowStart);

    if (record.timestamps.length >= config.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + config.windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    record.timestamps.push(now);

    return {
      allowed: true,
      remaining: config.maxRequests - record.timestamps.length,
    };
  }

  /**
   * Reset limits for a given identifier
   */
  static reset(identifier: string): void {
    rateLimitStore.delete(identifier);
  }

  /**
   * Clear all limits
   */
  static clearAll(): void {
    rateLimitStore.clear();
  }
}
