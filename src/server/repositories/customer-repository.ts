import { ObjectId } from 'mongodb';
import { getStorefrontDb } from '../db/mongodb';

export interface CustomerDocument {
  _id: string | ObjectId;
  authProviderId: string;
  authProvider: 'local' | 'google' | 'apple';
  email: string;
  passwordHash: string;
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
  emailVerificationToken?: {
    tokenHash: string;
    expiresAt: Date;
  } | null;
  passwordResetToken?: {
    tokenHash: string;
    expiresAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback for local dev / testing
const fallbackCustomers = new Map<string, CustomerDocument>();

// Pre-seed default demo account in fallback store
const demoId = '65d1a1111111111111111111';
fallbackCustomers.set('demo@veloce.com', {
  _id: demoId,
  authProviderId: 'demo@veloce.com',
  authProvider: 'local',
  email: 'demo@veloce.com',
  passwordHash: 'e7c653066928e08d6ef71731ba207da8:7597143e1c66708b7e289bf65d4960309971bc3922fa8167f22da924976a4aa44b7d515a4e3ff9be3f2fe09d57a94ea0ff17c76891ebdfdc92bc0c2f6d0fca81', // VelocePass123!
  firstName: 'Alexander',
  lastName: 'Veloce',
  phone: '+1 (555) 019-2834',
  profile: {
    preferredSizeSystem: 'US',
    preferredSizeValue: '10.5',
    marketingOptIn: true,
  },
  status: 'active',
  isEmailVerified: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
});

export class ServerCustomerRepository {
  /**
   * Create a new customer
   */
  static async create(data: Omit<CustomerDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<CustomerDocument> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        const docToInsert = {
          ...data,
          email: data.email.toLowerCase().trim(),
          createdAt: now,
          updatedAt: now,
        };
        const result = await db.collection<CustomerDocument>('customers').insertOne(docToInsert as any);
        return {
          ...docToInsert,
          _id: result.insertedId,
        };
      } catch (err) {
        console.warn('[MongoDB createCustomer Fallback]:', err);
      }
    }

    const normalizedEmail = data.email.toLowerCase().trim();
    if (fallbackCustomers.has(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const doc: CustomerDocument = {
      ...data,
      _id: new ObjectId().toString(),
      email: normalizedEmail,
      createdAt: now,
      updatedAt: now,
    };
    fallbackCustomers.set(normalizedEmail, doc);
    return doc;
  }

  /**
   * Find customer by email
   */
  static async findByEmail(email: string): Promise<CustomerDocument | null> {
    const normalized = email.toLowerCase().trim();
    const db = await getStorefrontDb();

    if (db) {
      try {
        const doc = await db.collection<CustomerDocument>('customers').findOne({ email: normalized });
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findCustomerByEmail Fallback]:', err);
      }
    }

    return fallbackCustomers.get(normalized) || null;
  }

  /**
   * Find customer by ID
   */
  static async findById(id: string): Promise<CustomerDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const doc = await db.collection<CustomerDocument>('customers').findOne(query as any);
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findCustomerById Fallback]:', err);
      }
    }

    const customersList = Array.from(fallbackCustomers.values());
    for (const c of customersList) {
      if (c._id.toString() === id.toString()) {
        return c;
      }
    }
    return null;
  }

  /**
   * Update customer profile details
   */
  static async updateProfile(
    id: string,
    updates: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      profile?: {
        preferredSizeSystem?: 'US' | 'UK' | 'EU';
        preferredSizeValue?: string;
        marketingOptIn?: boolean;
      };
    }
  ): Promise<CustomerDocument | null> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const res = await db.collection<CustomerDocument>('customers').findOneAndUpdate(
          query as any,
          {
            $set: {
              ...(updates.firstName !== undefined ? { firstName: updates.firstName } : {}),
              ...(updates.lastName !== undefined ? { lastName: updates.lastName } : {}),
              ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
              ...(updates.profile !== undefined ? { profile: updates.profile } : {}),
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as CustomerDocument;
      } catch (err) {
        console.warn('[MongoDB updateProfile Fallback]:', err);
      }
    }

    const entries = Array.from(fallbackCustomers.entries());
    for (const [email, c] of entries) {
      if (c._id.toString() === id.toString()) {
        const updated: CustomerDocument = {
          ...c,
          firstName: updates.firstName !== undefined ? updates.firstName : c.firstName,
          lastName: updates.lastName !== undefined ? updates.lastName : c.lastName,
          phone: updates.phone !== undefined ? updates.phone : c.phone,
          profile: updates.profile !== undefined ? { ...c.profile, ...updates.profile } : c.profile,
          updatedAt: now,
        };
        fallbackCustomers.set(email, updated);
        return updated;
      }
    }
    return null;
  }

  /**
   * Update customer password
   */
  static async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const res = await db.collection('customers').updateOne(query as any, {
          $set: { passwordHash, passwordResetToken: null, updatedAt: now },
        });
        return res.matchedCount > 0;
      } catch (err) {
        console.warn('[MongoDB updatePassword Fallback]:', err);
      }
    }

    const entries = Array.from(fallbackCustomers.entries());
    for (const [email, c] of entries) {
      if (c._id.toString() === id.toString()) {
        fallbackCustomers.set(email, {
          ...c,
          passwordHash,
          passwordResetToken: null,
          updatedAt: now,
        });
        return true;
      }
    }
    return false;
  }

  /**
   * Set password reset token
   */
  static async setPasswordResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<boolean> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const res = await db.collection('customers').updateOne(query as any, {
          $set: {
            passwordResetToken: { tokenHash, expiresAt },
            updatedAt: now,
          },
        });
        return res.matchedCount > 0;
      } catch (err) {
        console.warn('[MongoDB setPasswordResetToken Fallback]:', err);
      }
    }

    const entries = Array.from(fallbackCustomers.entries());
    for (const [email, c] of entries) {
      if (c._id.toString() === id.toString()) {
        fallbackCustomers.set(email, {
          ...c,
          passwordResetToken: { tokenHash, expiresAt },
          updatedAt: now,
        });
        return true;
      }
    }
    return false;
  }

  /**
   * Find customer by active reset token hash
   */
  static async findByResetToken(tokenHash: string): Promise<CustomerDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const doc = await db.collection<CustomerDocument>('customers').findOne({
          'passwordResetToken.tokenHash': tokenHash,
          'passwordResetToken.expiresAt': { $gt: new Date() },
        });
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findByResetToken Fallback]:', err);
      }
    }

    const now = Date.now();
    const customersList = Array.from(fallbackCustomers.values());
    for (const c of customersList) {
      if (
        c.passwordResetToken &&
        c.passwordResetToken.tokenHash === tokenHash &&
        c.passwordResetToken.expiresAt.getTime() > now
      ) {
        return c;
      }
    }
    return null;
  }

  /**
   * Set email verification token
   */
  static async setEmailVerificationToken(id: string, tokenHash: string, expiresAt: Date): Promise<boolean> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const res = await db.collection('customers').updateOne(query as any, {
          $set: {
            emailVerificationToken: { tokenHash, expiresAt },
            updatedAt: now,
          },
        });
        return res.matchedCount > 0;
      } catch (err) {
        console.warn('[MongoDB setEmailVerificationToken Fallback]:', err);
      }
    }

    const entries = Array.from(fallbackCustomers.entries());
    for (const [email, c] of entries) {
      if (c._id.toString() === id.toString()) {
        fallbackCustomers.set(email, {
          ...c,
          emailVerificationToken: { tokenHash, expiresAt },
          updatedAt: now,
        });
        return true;
      }
    }
    return false;
  }

  /**
   * Mark customer email as verified
   */
  static async verifyEmail(tokenHash: string): Promise<CustomerDocument | null> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        const res = await db.collection<CustomerDocument>('customers').findOneAndUpdate(
          {
            'emailVerificationToken.tokenHash': tokenHash,
            'emailVerificationToken.expiresAt': { $gt: now },
          },
          {
            $set: {
              isEmailVerified: true,
              emailVerificationToken: null,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as CustomerDocument;
      } catch (err) {
        console.warn('[MongoDB verifyEmail Fallback]:', err);
      }
    }

    const entries = Array.from(fallbackCustomers.entries());
    for (const [email, c] of entries) {
      if (
        c.emailVerificationToken &&
        c.emailVerificationToken.tokenHash === tokenHash &&
        c.emailVerificationToken.expiresAt.getTime() > Date.now()
      ) {
        const updated: CustomerDocument = {
          ...c,
          isEmailVerified: true,
          emailVerificationToken: null,
          updatedAt: now,
        };
        fallbackCustomers.set(email, updated);
        return updated;
      }
    }
    return null;
  }
}
