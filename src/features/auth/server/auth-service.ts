import { User, LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '../types';
import { UserRepository } from './user-repository';
import { PasswordService } from './password-service';
import { JWTService } from './jwt-service';

export const AUTH_COOKIE_NAME = 'veloce_session';

export class AuthService {
  /**
   * Register a new customer
   */
  static async register(input: RegisterInput): Promise<{ user: User; token: string; expiresAt: string }> {
    // Basic validation
    if (!input.email || !input.password || !input.firstName || !input.lastName) {
      throw new Error('All registration fields are required.');
    }

    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('Please provide a valid email address.');
    }

    const user = await UserRepository.create(input);
    const { token, expiresAt } = JWTService.sign(user.id, user.email);

    return { user, token, expiresAt };
  }

  /**
   * Authenticate customer with email and password
   */
  static async login(input: LoginInput): Promise<{ user: User; token: string; expiresAt: string }> {
    if (!input.email || !input.password) {
      throw new Error('Please enter both email and password.');
    }

    const record = await UserRepository.findByEmail(input.email);
    if (!record) {
      // Generic error preventing account enumeration
      throw new Error('Invalid email or password.');
    }

    const isValid = PasswordService.verifyPassword(input.password, record.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    if (record.user.status !== 'ACTIVE') {
      throw new Error('This account is currently suspended. Please contact concierge support.');
    }

    const { token, expiresAt } = JWTService.sign(record.user.id, record.user.email);
    return { user: record.user, token, expiresAt };
  }

  /**
   * Validate token and return active user profile
   */
  static async getCurrentUser(token?: string): Promise<User | null> {
    if (!token) return null;

    const payload = JWTService.verify(token);
    if (!payload) return null;

    const user = await UserRepository.findById(payload.userId);
    if (!user || user.status !== 'ACTIVE') return null;

    return user;
  }

  /**
   * Request password recovery token
   */
  static async requestPasswordReset(input: ForgotPasswordInput): Promise<{ message: string; previewToken?: string }> {
    if (!input.email) {
      throw new Error('Please provide your email address.');
    }

    const token = await UserRepository.createPasswordResetToken(input.email);

    // In production, an email is dispatched containing the reset link.
    // We return a safe generic message regardless of whether the email exists.
    return {
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      previewToken: token || undefined, // Provided for testing environment
    };
  }

  /**
   * Reset customer password with valid token
   */
  static async resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
    if (!input.token || !input.newPassword) {
      throw new Error('Token and new password are required.');
    }

    if (input.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const userId = await UserRepository.verifyAndConsumeResetToken(input.token);
    if (!userId) {
      throw new Error('This password reset link is invalid or has expired. Please request a new one.');
    }

    await UserRepository.updatePassword(userId, input.newPassword);

    return {
      success: true,
      message: 'Password successfully updated. You may now sign in with your new password.',
    };
  }
}
