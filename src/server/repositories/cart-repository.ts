import { ObjectId } from 'mongodb';
import { getStorefrontDb } from '../db/mongodb';

export interface CartItemDoc {
  variantId: string | ObjectId;
  productId: string | ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface CartDocument {
  _id: string | ObjectId;
  customerId?: string | ObjectId | null;
  guestId?: string | null;
  items: CartItemDoc[];
  status: 'active' | 'abandoned' | 'converted';
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback for local testing
const fallbackCarts: CartDocument[] = [];

export class ServerCartRepository {
  /**
   * Find active cart by authenticated customerId
   */
  static async findActiveByCustomerId(customerId: string): Promise<CartDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const queryCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        const doc = await db.collection<CartDocument>('carts').findOne({
          customerId: queryCustId as any,
          status: 'active',
        });
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findActiveByCustomerId Fallback]:', err);
      }
    }

    return (
      fallbackCarts.find(
        (c) => c.customerId?.toString() === customerId.toString() && c.status === 'active'
      ) || null
    );
  }

  /**
   * Find active cart by guestId
   */
  static async findActiveByGuestId(guestId: string): Promise<CartDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const doc = await db.collection<CartDocument>('carts').findOne({
          guestId,
          status: 'active',
        });
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findActiveByGuestId Fallback]:', err);
      }
    }

    return fallbackCarts.find((c) => c.guestId === guestId && c.status === 'active') || null;
  }

  /**
   * Get or create active cart for session
   */
  static async getOrCreateActive(session: { customerId?: string; guestId: string }): Promise<CartDocument> {
    let existing: CartDocument | null = null;

    if (session.customerId) {
      existing = await this.findActiveByCustomerId(session.customerId);
    } else {
      existing = await this.findActiveByGuestId(session.guestId);
    }

    if (existing) return existing;

    const now = new Date();
    const db = await getStorefrontDb();
    const custIdObj = session.customerId
      ? ObjectId.isValid(session.customerId)
        ? new ObjectId(session.customerId)
        : session.customerId
      : null;

    if (db) {
      try {
        const docToInsert = {
          customerId: custIdObj,
          guestId: session.customerId ? null : session.guestId,
          items: [],
          status: 'active' as const,
          lastActivityAt: now,
          createdAt: now,
          updatedAt: now,
        };
        const res = await db.collection<CartDocument>('carts').insertOne(docToInsert as any);
        return {
          ...docToInsert,
          _id: res.insertedId,
        };
      } catch (err) {
        console.warn('[MongoDB createCart Fallback]:', err);
      }
    }

    const fallbackDoc: CartDocument = {
      _id: new ObjectId().toString(),
      customerId: session.customerId || null,
      guestId: session.customerId ? null : session.guestId,
      items: [],
      status: 'active',
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    };
    fallbackCarts.push(fallbackDoc);
    return fallbackDoc;
  }

  /**
   * Add item to cart with deduplication and quantity increment up to maxQty
   */
  static async addItem(
    cartId: string,
    item: { variantId: string; productId: string; quantity: number },
    maxQty: number
  ): Promise<CartDocument> {
    const db = await getStorefrontDb();
    const now = new Date();
    const qCartId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : cartId;
    const vIdStr = item.variantId.toString();

    // 1. Check if item already exists in cart
    let cart = await this.findById(cartId);
    if (!cart) {
      throw new Error('Cart not found.');
    }

    const existingItemIndex = cart.items.findIndex(
      (i) => i.variantId.toString() === vIdStr
    );

    let updatedItems = [...cart.items];

    if (existingItemIndex > -1) {
      const currentQty = updatedItems[existingItemIndex].quantity;
      const newQty = Math.min(maxQty, currentQty + item.quantity);
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQty,
        addedAt: now,
      };
    } else {
      updatedItems.push({
        variantId: ObjectId.isValid(item.variantId) ? new ObjectId(item.variantId) : item.variantId,
        productId: ObjectId.isValid(item.productId) ? new ObjectId(item.productId) : item.productId,
        quantity: Math.min(maxQty, Math.max(1, item.quantity)),
        addedAt: now,
      });
    }

    if (db) {
      try {
        const res = await db.collection<CartDocument>('carts').findOneAndUpdate(
          { _id: qCartId as any },
          {
            $set: {
              items: updatedItems as any,
              lastActivityAt: now,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as CartDocument;
      } catch (err) {
        console.warn('[MongoDB addItem Fallback]:', err);
      }
    }

    const idx = fallbackCarts.findIndex((c) => c._id.toString() === cartId.toString());
    if (idx > -1) {
      fallbackCarts[idx] = {
        ...fallbackCarts[idx],
        items: updatedItems,
        lastActivityAt: now,
        updatedAt: now,
      };
      return fallbackCarts[idx];
    }

    return cart;
  }

  /**
   * Update quantity of a variant in cart
   */
  static async updateQuantity(cartId: string, variantId: string, quantity: number): Promise<CartDocument | null> {
    const db = await getStorefrontDb();
    const now = new Date();
    const qCartId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : cartId;
    const vIdStr = variantId.toString();

    let cart = await this.findById(cartId);
    if (!cart) return null;

    const updatedItems = cart.items.map((i) =>
      i.variantId.toString() === vIdStr ? { ...i, quantity } : i
    );

    if (db) {
      try {
        const res = await db.collection<CartDocument>('carts').findOneAndUpdate(
          { _id: qCartId as any },
          {
            $set: {
              items: updatedItems as any,
              lastActivityAt: now,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as CartDocument;
      } catch (err) {
        console.warn('[MongoDB updateQuantity Fallback]:', err);
      }
    }

    const idx = fallbackCarts.findIndex((c) => c._id.toString() === cartId.toString());
    if (idx > -1) {
      fallbackCarts[idx] = {
        ...fallbackCarts[idx],
        items: updatedItems,
        lastActivityAt: now,
        updatedAt: now,
      };
      return fallbackCarts[idx];
    }

    return null;
  }

  /**
   * Remove item from cart
   */
  static async removeItem(cartId: string, variantId: string): Promise<CartDocument | null> {
    const db = await getStorefrontDb();
    const now = new Date();
    const qCartId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : cartId;
    const vIdStr = variantId.toString();

    let cart = await this.findById(cartId);
    if (!cart) return null;

    const updatedItems = cart.items.filter((i) => i.variantId.toString() !== vIdStr);

    if (db) {
      try {
        const res = await db.collection<CartDocument>('carts').findOneAndUpdate(
          { _id: qCartId as any },
          {
            $set: {
              items: updatedItems as any,
              lastActivityAt: now,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as CartDocument;
      } catch (err) {
        console.warn('[MongoDB removeItem Fallback]:', err);
      }
    }

    const idx = fallbackCarts.findIndex((c) => c._id.toString() === cartId.toString());
    if (idx > -1) {
      fallbackCarts[idx] = {
        ...fallbackCarts[idx],
        items: updatedItems,
        lastActivityAt: now,
        updatedAt: now,
      };
      return fallbackCarts[idx];
    }

    return null;
  }

  /**
   * Clear all items in cart
   */
  static async clearCart(cartId: string): Promise<CartDocument | null> {
    const db = await getStorefrontDb();
    const now = new Date();
    const qCartId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : cartId;

    if (db) {
      try {
        const res = await db.collection<CartDocument>('carts').findOneAndUpdate(
          { _id: qCartId as any },
          {
            $set: {
              items: [],
              lastActivityAt: now,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );
        if (res) return res as CartDocument;
      } catch (err) {
        console.warn('[MongoDB clearCart Fallback]:', err);
      }
    }

    const idx = fallbackCarts.findIndex((c) => c._id.toString() === cartId.toString());
    if (idx > -1) {
      fallbackCarts[idx] = {
        ...fallbackCarts[idx],
        items: [],
        lastActivityAt: now,
        updatedAt: now,
      };
      return fallbackCarts[idx];
    }

    return null;
  }

  /**
   * Find cart by ID
   */
  static async findById(cartId: string): Promise<CartDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const qCartId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : cartId;
        const doc = await db.collection<CartDocument>('carts').findOne({ _id: qCartId as any });
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findCartById Fallback]:', err);
      }
    }

    return fallbackCarts.find((c) => c._id.toString() === cartId.toString()) || null;
  }

  /**
   * Deactivate guest cart (e.g. after merging into customer cart)
   */
  static async deactivateGuestCart(guestId: string): Promise<void> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        await db.collection('carts').updateMany(
          { guestId, status: 'active' },
          { $set: { status: 'converted', updatedAt: now } }
        );
        return;
      } catch (err) {
        console.warn('[MongoDB deactivateGuestCart Fallback]:', err);
      }
    }

    for (const c of fallbackCarts) {
      if (c.guestId === guestId && c.status === 'active') {
        c.status = 'converted';
        c.updatedAt = now;
      }
    }
  }

  /**
   * Reset fallback store (useful for tests)
   */
  static clearFallbackStore(): void {
    fallbackCarts.length = 0;
  }
}
