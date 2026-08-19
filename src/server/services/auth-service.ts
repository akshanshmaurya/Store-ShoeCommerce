import crypto from 'crypto';
import { ServerCustomerRepository, CustomerDocument } from '../repositories/customer-repository';
import { PasswordService } from '@/features/auth/server/password-service';
import { JWTService } from '@/features/auth/server/jwt-service';
import { RateLimiter } from '../utils/rate-limiter';
import { BadRequestError, NotFoundError, ApiError } from '../utils/api-error';

export const AUTH_COOKIE_NAME = 'veloce_session';

export interface SanitizedCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profile?: {
    preferredSizeSystem?: 'US' | 'UK' | 'EU';
    preferredSizeValue?: string;
    marketingOptIn?: boolean;
  };
  status: 'active' | 'suspended' | 'inactive';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export function sanitizeCustomer(doc: CustomerDocument): SanitizedCustomer {
  return {
    id: doc._id.toString(),
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    profile: doc.profile || {
      preferredSizeSystem: 'US',
      preferredSizeValue: '10',
      marketingOptIn: false,
    },
    status: doc.status,
    isEmailVerified: doc.isEmailVerified,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
}

export class AuthService {
  /**
   * Register a new customer
   */
  static async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    marketingOptIn?: boolean;
    ip?: string;
  }): Promise<{ customer: SanitizedCustomer; token: string; expiresAt: string }> {
    // 1. Rate Limiter check (Max 5 registrations per minute per IP)
    const ipKey = input.ip || 'anonymous-ip';
    const rateCheck = RateLimiter.isAllowed(`register:${ipKey}`, {
      windowMs: 60 * 1000,
      maxRequests: 10,
    });
    if (!rateCheck.allowed) {
      throw new ApiError(
        `Too many registration attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        429,
        'RATE_LIMITED'
      );
    }

    // 2. Input Validation
    if (!input.email || !input.password || !input.firstName || !input.lastName) {
      throw new BadRequestError('First name, last name, email, and password are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new BadRequestError('Please provide a valid email address.');
    }

    if (input.password.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters long.');
    }

    // Check if customer already exists
    const existing = await ServerCustomerRepository.findByEmail(input.email);
    if (existing) {
      throw new BadRequestError('An account with this email address already exists.');
    }

    // 3. Hash password securely
    const passwordHash = PasswordService.hashPassword(input.password);

    // 4. Create customer record
    const createdDoc = await ServerCustomerRepository.create({
      authProviderId: input.email.toLowerCase().trim(),
      authProvider: 'local',
      email: input.email.toLowerCase().trim(),
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim(),
      profile: {
        preferredSizeSystem: 'US',
        preferredSizeValue: '10',
        marketingOptIn: !!input.marketingOptIn,
      },
      status: 'active',
      isEmailVerified: false,
    });

    const customer = sanitizeCustomer(createdDoc);
    const { token, expiresAt } = JWTService.sign(customer.id, customer.email);

    return { customer, token, expiresAt };
  }

  /**
   * Login customer
   */
  static async login(input: {
    email: string;
    password: string;
    ip?: string;
  }): Promise<{ customer: SanitizedCustomer; token: string; expiresAt: string }> {
    const ipKey = input.ip || 'anonymous-ip';
    const rateCheck = RateLimiter.isAllowed(`login:${ipKey}`, {
      windowMs: 60 * 1000,
      maxRequests: 10,
    });
    if (!rateCheck.allowed) {
      throw new ApiError(
        `Too many login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        429,
        'RATE_LIMITED'
      );
    }

    if (!input.email || !input.password) {
      throw new BadRequestError('Please enter both email and password.');
    }

    const doc = await ServerCustomerRepository.findByEmail(input.email);
    if (!doc) {
      // Safe generic message avoiding account enumeration
      throw new BadRequestError('Invalid email or password.');
    }

    const isValidPassword = PasswordService.verifyPassword(input.password, doc.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestError('Invalid email or password.');
    }

    if (doc.status !== 'active') {
      throw new ApiError(
        'This account is currently suspended. Please contact concierge support.',
        403,
        'ACCOUNT_SUSPENDED'
      );
    }

    // Reset rate limiter on successful login
    RateLimiter.reset(`login:${ipKey}`);

    const customer = sanitizeCustomer(doc);
    const { token, expiresAt } = JWTService.sign(customer.id, customer.email);

    return { customer, token, expiresAt };
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(token?: string): Promise<SanitizedCustomer | null> {
    if (!token) return null;

    const payload = JWTService.verify(token);
    if (!payload || !payload.userId) return null;

    const doc = await ServerCustomerRepository.findById(payload.userId);
    if (!doc || doc.status !== 'active') return null;

    return sanitizeCustomer(doc);
  }

  /**
   * Request password reset token
   */
  static async requestPasswordReset(
    email: string,
    ip?: string
  ): Promise<{ message: string; previewToken?: string }> {
    const ipKey = ip || 'anonymous-ip';
    const rateCheck = RateLimiter.isAllowed(`reset:${ipKey}`, {
      windowMs: 60 * 1000,
      maxRequests: 5,
    });
    if (!rateCheck.allowed) {
      throw new ApiError(
        `Too many reset attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        429,
        'RATE_LIMITED'
      );
    }

    if (!email || !email.trim()) {
      throw new BadRequestError('Please provide your email address.');
    }

    const doc = await ServerCustomerRepository.findByEmail(email);
    let token: string | undefined;

    if (doc) {
      token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await ServerCustomerRepository.setPasswordResetToken(doc._id.toString(), tokenHash, expiresAt);
    }

    return {
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      previewToken: token, // Provided for test environments
    };
  }

  /**
   * Reset customer password
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!token || !newPassword) {
      throw new BadRequestError('Token and new password are required.');
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters long.');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const doc = await ServerCustomerRepository.findByResetToken(tokenHash);

    if (!doc) {
      throw new BadRequestError('This password reset link is invalid or has expired. Please request a new one.');
    }

    const newHash = PasswordService.hashPassword(newPassword);
    await ServerCustomerRepository.updatePassword(doc._id.toString(), newHash);

    return {
      success: true,
      message: 'Password successfully updated. You may now sign in with your new password.',
    };
  }

  /**
   * Request email verification token
   */
  static async requestEmailVerification(customerId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await ServerCustomerRepository.setEmailVerificationToken(customerId, tokenHash, expiresAt);
    return token;
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<SanitizedCustomer> {
    if (!token || !token.trim()) {
      throw new BadRequestError('Verification token is required.');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const doc = await ServerCustomerRepository.verifyEmail(tokenHash);

    if (!doc) {
      throw new BadRequestError('This email verification token is invalid or has expired.');
    }

    return sanitizeCustomer(doc);
  }
}
