import { ObjectId } from 'mongodb';
import { getStorefrontDb } from '../db/mongodb';

export interface WishlistItemDoc {
  productId: string | ObjectId;
  variantId?: string | ObjectId | null;
  addedAt: Date;
}

export interface WishlistDocument {
  _id: string | ObjectId;
  customerId: string | ObjectId;
  items: WishlistItemDoc[];
  createdAt: Date;
  updatedAt: Date;
}

const fallbackWishlists: WishlistDocument[] = [];

export class ServerWishlistRepository {
  /**
   * Find wishlist by customerId
   */
  static async findByCustomerId(customerId: string): Promise<WishlistDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const qCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        const doc = await db.collection<WishlistDocument>('wishlists').findOne({
          customerId: qCustId as any,
        });
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findWishlistByCustomerId Fallback]:', err);
      }
    }

    return (
      fallbackWishlists.find((w) => w.customerId.toString() === customerId.toString()) || null
    );
  }

  /**
   * Get or create customer wishlist
   */
  static async getOrCreate(customerId: string): Promise<WishlistDocument> {
    const existing = await this.findByCustomerId(customerId);
    if (existing) return existing;

    const now = new Date();
    const db = await getStorefrontDb();
    const qCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;

    if (db) {
      try {
        const docToInsert = {
          customerId: qCustId as any,
          items: [],
          createdAt: now,
          updatedAt: now,
        };
        const res = await db.collection<WishlistDocument>('wishlists').insertOne(docToInsert as any);
        return {
          ...docToInsert,
          _id: res.insertedId,
        };
      } catch (err) {
        console.warn('[MongoDB createWishlist Fallback]:', err);
      }
    }

    const fallbackDoc: WishlistDocument = {
      _id: new ObjectId().toString(),
      customerId,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    fallbackWishlists.push(fallbackDoc);
    return fallbackDoc;
  }

  /**
   * Add item to wishlist (deduplicated by productId)
   */
  static async addItem(
    customerId: string,
    productId: string,
    variantId?: string
  ): Promise<WishlistDocument> {
    const wishlist = await this.getOrCreate(customerId);
    const now = new Date();
    const pIdStr = productId.toString();

    // Prevent duplicates
    const exists = wishlist.items.some((i) => i.productId.toString() === pIdStr);
    if (exists) {
      return wishlist;
    }

    const updatedItems = [
      ...wishlist.items,
      {
        productId: ObjectId.isValid(productId) ? new ObjectId(productId) : productId,
        variantId: variantId ? (ObjectId.isValid(variantId) ? new ObjectId(variantId) : variantId) : null,
        addedAt: now,
      },
    ];

    const db = await getStorefrontDb();
    const qCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;

    if (db) {
      try {
        const res = await db.collection<WishlistDocument>('wishlists').findOneAndUpdate(
          { customerId: qCustId as any },
          {
            $set: {
              items: updatedItems as any,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as WishlistDocument;
      } catch (err) {
        console.warn('[MongoDB addWishlistItem Fallback]:', err);
      }
    }

    const idx = fallbackWishlists.findIndex((w) => w.customerId.toString() === customerId.toString());
    if (idx > -1) {
      fallbackWishlists[idx] = {
        ...fallbackWishlists[idx],
        items: updatedItems,
        updatedAt: now,
      };
      return fallbackWishlists[idx];
    }

    return wishlist;
  }

  /**
   * Remove item from wishlist
   */
  static async removeItem(customerId: string, productId: string): Promise<WishlistDocument | null> {
    const wishlist = await this.findByCustomerId(customerId);
    if (!wishlist) return null;

    const now = new Date();
    const pIdStr = productId.toString();
    const updatedItems = wishlist.items.filter((i) => i.productId.toString() !== pIdStr);

    const db = await getStorefrontDb();
    const qCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;

    if (db) {
      try {
        const res = await db.collection<WishlistDocument>('wishlists').findOneAndUpdate(
          { customerId: qCustId as any },
          {
            $set: {
              items: updatedItems as any,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as WishlistDocument;
      } catch (err) {
        console.warn('[MongoDB removeWishlistItem Fallback]:', err);
      }
    }

    const idx = fallbackWishlists.findIndex((w) => w.customerId.toString() === customerId.toString());
    if (idx > -1) {
      fallbackWishlists[idx] = {
        ...fallbackWishlists[idx],
        items: updatedItems,
        updatedAt: now,
      };
      return fallbackWishlists[idx];
    }

    return null;
  }

  /**
   * Clear customer wishlist
   */
  static async clearWishlist(customerId: string): Promise<void> {
    const db = await getStorefrontDb();
    const now = new Date();
    const qCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;

    if (db) {
      try {
        await db.collection('wishlists').updateOne(
          { customerId: qCustId as any },
          { $set: { items: [], updatedAt: now } }
        );
        return;
      } catch (err) {
        console.warn('[MongoDB clearWishlist Fallback]:', err);
      }
    }

    const idx = fallbackWishlists.findIndex((w) => w.customerId.toString() === customerId.toString());
    if (idx > -1) {
      fallbackWishlists[idx].items = [];
      fallbackWishlists[idx].updatedAt = now;
    }
  }

  /**
   * Clear fallback store (useful for tests)
   */
  static clearFallbackStore(): void {
    fallbackWishlists.length = 0;
  }
}
