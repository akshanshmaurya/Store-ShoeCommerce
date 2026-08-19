import { ObjectId } from 'mongodb';
import { getStorefrontDb } from '../db/mongodb';

export interface AddressDocument {
  _id: string | ObjectId;
  customerId: string | ObjectId;
  recipientName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'shipping' | 'billing' | 'both';
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback for local dev / testing
const fallbackAddresses: AddressDocument[] = [];

export class ServerAddressRepository {
  /**
   * Find all addresses for a specific customer
   */
  static async findByCustomerId(customerId: string): Promise<AddressDocument[]> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const queryId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        const docs = await db
          .collection<AddressDocument>('addresses')
          .find({ customerId: queryId as any })
          .sort({ isDefault: -1, createdAt: -1 })
          .toArray();
        if (docs) return docs;
      } catch (err) {
        console.warn('[MongoDB findAddressesByCustomerId Fallback]:', err);
      }
    }

    return fallbackAddresses.filter(
      (a) => a.customerId.toString() === customerId.toString()
    );
  }

  /**
   * Find specific address strictly scoped to customerId
   */
  static async findById(id: string, customerId: string): Promise<AddressDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const queryId = ObjectId.isValid(id) ? new ObjectId(id) : id;
        const queryCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        const doc = await db.collection<AddressDocument>('addresses').findOne({
          _id: queryId as any,
          customerId: queryCustId as any,
        });
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findAddressById Fallback]:', err);
      }
    }

    return (
      fallbackAddresses.find(
        (a) =>
          a._id.toString() === id.toString() &&
          a.customerId.toString() === customerId.toString()
      ) || null
    );
  }

  /**
   * Create a new address for customer
   */
  static async create(
    customerId: string,
    data: Omit<AddressDocument, '_id' | 'customerId' | 'createdAt' | 'updatedAt'>
  ): Promise<AddressDocument> {
    const db = await getStorefrontDb();
    const now = new Date();
    const custIdObj = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;

    // If this address is set as default, unset other defaults for this customer
    if (data.isDefault) {
      await this.clearDefaults(customerId);
    }

    if (db) {
      try {
        const docToInsert = {
          ...data,
          customerId: custIdObj,
          createdAt: now,
          updatedAt: now,
        };
        const result = await db.collection<AddressDocument>('addresses').insertOne(docToInsert as any);
        return {
          ...docToInsert,
          _id: result.insertedId,
        };
      } catch (err) {
        console.warn('[MongoDB createAddress Fallback]:', err);
      }
    }

    const newDoc: AddressDocument = {
      ...data,
      _id: new ObjectId().toString(),
      customerId,
      createdAt: now,
      updatedAt: now,
    };
    fallbackAddresses.push(newDoc);
    return newDoc;
  }

  /**
   * Update address strictly scoped to customerId
   */
  static async update(
    id: string,
    customerId: string,
    data: Partial<Omit<AddressDocument, '_id' | 'customerId' | 'createdAt' | 'updatedAt'>>
  ): Promise<AddressDocument | null> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (data.isDefault) {
      await this.clearDefaults(customerId);
    }

    if (db) {
      try {
        const queryId = ObjectId.isValid(id) ? new ObjectId(id) : id;
        const queryCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;

        const res = await db.collection<AddressDocument>('addresses').findOneAndUpdate(
          { _id: queryId as any, customerId: queryCustId as any },
          {
            $set: {
              ...data,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as AddressDocument;
      } catch (err) {
        console.warn('[MongoDB updateAddress Fallback]:', err);
      }
    }

    const idx = fallbackAddresses.findIndex(
      (a) =>
        a._id.toString() === id.toString() &&
        a.customerId.toString() === customerId.toString()
    );
    if (idx >= 0) {
      fallbackAddresses[idx] = {
        ...fallbackAddresses[idx],
        ...data,
        updatedAt: now,
      };
      return fallbackAddresses[idx];
    }

    return null;
  }

  /**
   * Delete address strictly scoped to customerId
   */
  static async delete(id: string, customerId: string): Promise<boolean> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const queryId = ObjectId.isValid(id) ? new ObjectId(id) : id;
        const queryCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        const res = await db.collection('addresses').deleteOne({
          _id: queryId as any,
          customerId: queryCustId as any,
        });
        return res.deletedCount > 0;
      } catch (err) {
        console.warn('[MongoDB deleteAddress Fallback]:', err);
      }
    }

    const idx = fallbackAddresses.findIndex(
      (a) =>
        a._id.toString() === id.toString() &&
        a.customerId.toString() === customerId.toString()
    );
    if (idx >= 0) {
      fallbackAddresses.splice(idx, 1);
      return true;
    }

    return false;
  }

  /**
   * Set address as default for this customer only
   */
  static async setDefault(id: string, customerId: string): Promise<AddressDocument | null> {
    await this.clearDefaults(customerId);
    return this.update(id, customerId, { isDefault: true });
  }

  /**
   * Clear isDefault on all addresses for this customer only
   */
  private static async clearDefaults(customerId: string): Promise<void> {
    const db = await getStorefrontDb();
    const custIdObj = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;

    if (db) {
      try {
        await db.collection('addresses').updateMany(
          { customerId: custIdObj as any },
          { $set: { isDefault: false } }
        );
        return;
      } catch (err) {
        console.warn('[MongoDB clearDefaults Fallback]:', err);
      }
    }

    for (const a of fallbackAddresses) {
      if (a.customerId.toString() === customerId.toString()) {
        a.isDefault = false;
      }
    }
  }
}
