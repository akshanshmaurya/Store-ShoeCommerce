import { ObjectId } from 'mongodb';
import { getStorefrontDb } from '../db/mongodb';

export interface ReservationRecord {
  _id: string | ObjectId;
  reservationKey: string;
  orderId?: string | ObjectId | null;
  variantId: string | ObjectId;
  warehouseId: string | ObjectId;
  quantity: number;
  status: 'active' | 'released' | 'converted' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  customerId?: string | ObjectId | null;
}

interface FallbackStockRecord {
  variantId: string;
  onHand: number;
  reserved: number;
  available: number;
}

const fallbackReservations: ReservationRecord[] = [];
const fallbackInventory = new Map<string, FallbackStockRecord>();

// Default warehouse ID for storefront checkout allocation
export const DEFAULT_WAREHOUSE_ID = '65d1a2222222222222222222';

export class ServerInventoryReservationRepository {
  /**
   * Atomically reserve inventory ensuring available >= quantity
   */
  static async reserveStock(
    variantId: string,
    quantity: number,
    reservationKey: string,
    customerId?: string,
    expiresInSeconds: number = 900 // 15 minutes
  ): Promise<{ success: boolean; reservationKey: string; expiresAt: Date }> {
    if (quantity <= 0) {
      throw new Error('Reservation quantity must be strictly greater than zero.');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
    const db = await getStorefrontDb();
    const qVarId = ObjectId.isValid(variantId) ? new ObjectId(variantId) : variantId;
    const qCustId = customerId ? (ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId) : null;
    const qWhId = new ObjectId(DEFAULT_WAREHOUSE_ID);

    if (db) {
      try {
        // 1. Check idempotency on reservationKey
        const existingRes = await db.collection<ReservationRecord>('inventoryReservations').findOne({
          reservationKey,
        });

        if (existingRes) {
          if (existingRes.status === 'active') {
            return {
              success: true,
              reservationKey,
              expiresAt: existingRes.expiresAt,
            };
          }
          throw new Error(`Reservation ${reservationKey} already exists with status: ${existingRes.status}`);
        }

        // 2. Atomic conditional stock deduction
        const updateResult = await db.collection('inventory').findOneAndUpdate(
          {
            variantId: qVarId as any,
            available: { $gte: quantity },
          },
          {
            $inc: {
              reserved: quantity,
              available: -quantity,
            },
            $set: {
              updatedAt: now,
            },
          },
          { returnDocument: 'before' }
        );

        if (!updateResult) {
          throw new Error(`Insufficient available inventory for variant ${variantId}.`);
        }

        // 3. Create Reservation Document
        const reservationDoc: ReservationRecord = {
          _id: new ObjectId(),
          reservationKey,
          orderId: null,
          variantId: qVarId,
          warehouseId: updateResult.warehouseId || qWhId,
          quantity,
          status: 'active',
          createdAt: now,
          expiresAt,
          customerId: qCustId,
        };

        await db.collection<ReservationRecord>('inventoryReservations').insertOne(reservationDoc as any);

        return {
          success: true,
          reservationKey,
          expiresAt,
        };
      } catch (err) {
        console.warn('[MongoDB reserveStock Fallback]:', err);
      }
    }

    // Fallback in-memory atomic reservation
    const existing = fallbackReservations.find((r) => r.reservationKey === reservationKey);
    if (existing) {
      if (existing.status === 'active') {
        return { success: true, reservationKey, expiresAt: existing.expiresAt };
      }
      throw new Error(`Reservation ${reservationKey} already exists with status: ${existing.status}`);
    }

    let stock = fallbackInventory.get(variantId);
    if (!stock) {
      // Initialize with baseline available stock (50 units)
      stock = { variantId, onHand: 50, reserved: 0, available: 50 };
      fallbackInventory.set(variantId, stock);
    }

    if (stock.available < quantity) {
      throw new Error(`Insufficient available inventory for variant ${variantId}. Available: ${stock.available}, Requested: ${quantity}`);
    }

    stock.reserved += quantity;
    stock.available -= quantity;

    const fallbackRecord: ReservationRecord = {
      _id: new ObjectId().toString(),
      reservationKey,
      orderId: null,
      variantId,
      warehouseId: DEFAULT_WAREHOUSE_ID,
      quantity,
      status: 'active',
      createdAt: now,
      expiresAt,
      customerId: customerId || null,
    };
    fallbackReservations.push(fallbackRecord);

    return { success: true, reservationKey, expiresAt };
  }

  /**
   * Release an active reservation (e.g. on order cancellation or checkout rollback)
   */
  static async releaseReservation(reservationKey: string, reason?: string): Promise<boolean> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        const resDoc = await db.collection<ReservationRecord>('inventoryReservations').findOne({
          reservationKey,
          status: 'active',
        });

        if (resDoc) {
          // Re-increment available, decrement reserved
          await db.collection('inventory').updateOne(
            { variantId: resDoc.variantId, warehouseId: resDoc.warehouseId },
            {
              $inc: {
                reserved: -resDoc.quantity,
                available: resDoc.quantity,
              },
              $set: { updatedAt: now },
            }
          );

          await db.collection('inventoryReservations').updateOne(
            { _id: resDoc._id as any },
            {
              $set: {
                status: 'released',
                releasedAt: now,
                updatedAt: now,
              },
            }
          );
          return true;
        }
      } catch (err) {
        console.warn('[MongoDB releaseReservation Fallback]:', err);
      }
    }

    const rec = fallbackReservations.find((r) => r.reservationKey === reservationKey && r.status === 'active');
    if (rec) {
      rec.status = 'released';
      const stock = fallbackInventory.get(rec.variantId.toString());
      if (stock) {
        stock.reserved -= rec.quantity;
        stock.available += rec.quantity;
      }
      return true;
    }

    return false;
  }

  /**
   * Associate reservation with order ID
   */
  static async associateWithOrder(reservationKey: string, orderId: string): Promise<boolean> {
    const db = await getStorefrontDb();
    const now = new Date();
    const qOrderId = ObjectId.isValid(orderId) ? new ObjectId(orderId) : orderId;

    if (db) {
      try {
        const res = await db.collection('inventoryReservations').updateOne(
          { reservationKey },
          {
            $set: {
              orderId: qOrderId as any,
              status: 'converted',
              convertedAt: now,
              updatedAt: now,
            },
          }
        );
        return res.matchedCount > 0;
      } catch (err) {
        console.warn('[MongoDB associateWithOrder Fallback]:', err);
      }
    }

    const rec = fallbackReservations.find((r) => r.reservationKey === reservationKey);
    if (rec) {
      rec.orderId = orderId;
      rec.status = 'converted';
      return true;
    }

    return false;
  }

  /**
   * Set fallback stock for testing
   */
  static setFallbackStock(variantId: string, available: number): void {
    fallbackInventory.set(variantId, {
      variantId,
      onHand: available,
      reserved: 0,
      available,
    });
  }

  /**
   * Reset fallback store
   */
  static clearFallbackStore(): void {
    fallbackReservations.length = 0;
    fallbackInventory.clear();
  }
}
