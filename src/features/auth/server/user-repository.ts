import { User, RegisterInput } from '../types';
import { PasswordService } from './password-service';
import crypto from 'crypto';

interface StoredUserRecord {
  user: User;
  passwordHash: string;
}

interface PasswordResetRecord {
  token: string;
  userId: string;
  expiresAt: number; // Unix timestamp
}

// Global user store preserving state across Next.js dev server reloads
const globalForAuth = globalThis as unknown as {
  _veloceUsers?: Map<string, StoredUserRecord>;
  _veloceResetTokens?: Map<string, PasswordResetRecord>;
};

if (!globalForAuth._veloceUsers) {
  globalForAuth._veloceUsers = new Map();
  globalForAuth._veloceResetTokens = new Map();

  // Seed default demo customer account
  const demoId = 'usr-demo-001';
  const demoEmail = 'demo@veloce.com';
  const demoPassword = 'VelocePass123!';
  const demoHash = PasswordService.hashPassword(demoPassword);

  const demoUser: User = {
    id: demoId,
    email: demoEmail,
    firstName: 'Alexander',
    lastName: 'Veloce',
    status: 'ACTIVE',
    profile: {
      firstName: 'Alexander',
      lastName: 'Veloce',
      phone: '+1 (555) 019-2834',
      preferredSizeSystem: 'US',
      preferredSizeValue: '10.5',
      marketingOptIn: true,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  globalForAuth._veloceUsers.set(demoEmail.toLowerCase(), {
    user: demoUser,
    passwordHash: demoHash,
  });
}

const users = globalForAuth._veloceUsers!;
const resetTokens = globalForAuth._veloceResetTokens!;

export class UserRepository {
  /**
   * Find user by normalized email
   */
  static async findByEmail(email: string): Promise<{ user: User; passwordHash: string } | null> {
    const record = users.get(email.trim().toLowerCase());
    if (!record) return null;
    return { ...record };
  }

  /**
   * Find user by unique ID
   */
  static async findById(id: string): Promise<User | null> {
    const userRecords = Array.from(users.values());
    for (const record of userRecords) {
      if (record.user.id === id) {
        return { ...record.user };
      }
    }
    return null;
  }

  /**
   * Register a new customer
   */
  static async create(input: RegisterInput): Promise<User> {
    const normalizedEmail = input.email.trim().toLowerCase();

    if (users.has(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const userId = `usr-${crypto.randomBytes(8).toString('hex')}`;
    const passwordHash = PasswordService.hashPassword(input.password);
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      status: 'ACTIVE',
      profile: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        marketingOptIn: !!input.marketingOptIn,
      },
      createdAt: now,
      updatedAt: now,
    };

    users.set(normalizedEmail, {
      user: newUser,
      passwordHash,
    });

    return { ...newUser };
  }

  /**
   * Update customer password
   */
  static async updatePassword(userId: string, newPasswordPlain: string): Promise<boolean> {
    const userEntries = Array.from(users.entries());
    for (const [email, record] of userEntries) {
      if (record.user.id === userId) {
        const newHash = PasswordService.hashPassword(newPasswordPlain);
        users.set(email, {
          user: { ...record.user, updatedAt: new Date().toISOString() },
          passwordHash: newHash,
        });
        return true;
      }
    }
    return false;
  }

  /**
   * Create short-lived password reset token (15 mins)
   */
  static async createPasswordResetToken(email: string): Promise<string | null> {
    const normalized = email.trim().toLowerCase();
    const record = users.get(normalized);
    if (!record) return null; // Safe handled

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    resetTokens.set(token, {
      token,
      userId: record.user.id,
      expiresAt,
    });

    return token;
  }

  /**
   * Validate password reset token
   */
  static async verifyAndConsumeResetToken(token: string): Promise<string | null> {
    const record = resetTokens.get(token);
    if (!record) return null;

    if (record.expiresAt < Date.now()) {
      resetTokens.delete(token);
      return null;
    }

    // Invalidate token after consumption (one-time use)
    resetTokens.delete(token);
    return record.userId;
  }
}
