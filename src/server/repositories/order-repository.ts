import { ObjectId } from 'mongodb';
import { getStorefrontDb } from '../db/mongodb';

export interface OrderItemSnapshot {
  productId: string | ObjectId;
  variantId: string | ObjectId;
  productName: string;
  productSlug: string;
  sku: string;
  size: string;
  color: string;
  imageUrl?: string | null;
  unitPrice: number;
  compareAtPrice?: number | null;
  orderedQuantity: number;
  cancelledQuantity: number;
  fulfilledQuantity: number;
  returnedQuantity: number;
  lineTotal: number;
  lineDiscount: number;
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';
}

export interface OrderAddressSnapshot {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderDocument {
  _id: string | ObjectId;
  orderNumber: string;
  idempotencyKey: string;
  customerId: string | ObjectId;
  customerEmail: string;
  customerPhone?: string | null;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'partially_returned'
    | 'returned';
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed' | 'partially_refunded' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  items: OrderItemSnapshot[];
  reservationKeys: string[];
  discounts: Array<{ type: string; code?: string | null; description?: string | null; amount: number }>;
  source: 'web';
  notes?: string | null;
  cancelReason?: string | null;
  placedAt: Date;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const fallbackOrders: OrderDocument[] = [];

export class ServerOrderRepository {
  /**
   * Create an order document
   */
  static async create(
    order: Omit<OrderDocument, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<OrderDocument> {
    const db = await getStorefrontDb();
    const now = new Date();
    const qCustId = ObjectId.isValid(order.customerId) ? new ObjectId(order.customerId) : order.customerId;

    if (db) {
      try {
        const docToInsert = {
          ...order,
          customerId: qCustId as any,
          createdAt: now,
          updatedAt: now,
        };
        const res = await db.collection<OrderDocument>('orders').insertOne(docToInsert as any);
        return {
          ...docToInsert,
          _id: res.insertedId,
        };
      } catch (err) {
        console.warn('[MongoDB createOrder Fallback]:', err);
      }
    }

    const fallbackDoc: OrderDocument = {
      ...order,
      _id: new ObjectId().toString(),
      createdAt: now,
      updatedAt: now,
    };
    fallbackOrders.push(fallbackDoc);
    return fallbackDoc;
  }

  /**
   * Find order by idempotency key and customerId
   */
  static async findByIdempotencyKey(key: string, customerId: string): Promise<OrderDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const qCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        const doc = await db.collection<OrderDocument>('orders').findOne({
          idempotencyKey: key,
          customerId: qCustId as any,
        });
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findByIdempotencyKey Fallback]:', err);
      }
    }

    return (
      fallbackOrders.find(
        (o) => o.idempotencyKey === key && o.customerId.toString() === customerId.toString()
      ) || null
    );
  }

  /**
   * Find order by unique order number (strictly scoped to customerId if provided)
   */
  static async findByOrderNumber(orderNumber: string, customerId?: string): Promise<OrderDocument | null> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const query: any = { orderNumber };
        if (customerId) {
          query.customerId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        }
        const doc = await db.collection<OrderDocument>('orders').findOne(query);
        if (doc) return doc;
      } catch (err) {
        console.warn('[MongoDB findByOrderNumber Fallback]:', err);
      }
    }

    return (
      fallbackOrders.find((o) => {
        const matchesNumber = o.orderNumber.toUpperCase() === orderNumber.toUpperCase();
        if (!matchesNumber) return false;
        if (customerId && o.customerId.toString() !== customerId.toString()) return false;
        return true;
      }) || null
    );
  }

  /**
   * Find all orders for a customer (sorted by placedAt: -1)
   */
  static async findByCustomerId(customerId: string): Promise<OrderDocument[]> {
    const db = await getStorefrontDb();

    if (db) {
      try {
        const qCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        const docs = await db
          .collection<OrderDocument>('orders')
          .find({ customerId: qCustId as any })
          .sort({ placedAt: -1 })
          .toArray();
        if (docs) return docs;
      } catch (err) {
        console.warn('[MongoDB findOrdersByCustomerId Fallback]:', err);
      }
    }

    return fallbackOrders
      .filter((o) => o.customerId.toString() === customerId.toString())
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }

  /**
   * Update order status
   */
  static async updateStatus(
    orderNumber: string,
    customerId: string,
    status: OrderDocument['status'],
    cancelReason?: string
  ): Promise<OrderDocument | null> {
    const db = await getStorefrontDb();
    const now = new Date();

    if (db) {
      try {
        const qCustId = ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId;
        const setFields: any = {
          status,
          updatedAt: now,
        };
        if (status === 'cancelled') {
          setFields.cancelledAt = now;
          setFields.cancelReason = cancelReason || 'Customer requested cancellation';
        }

        const res = await db.collection<OrderDocument>('orders').findOneAndUpdate(
          { orderNumber, customerId: qCustId as any },
          { $set: setFields },
          { returnDocument: 'after' }
        );
        if (res) return res as OrderDocument;
      } catch (err) {
        console.warn('[MongoDB updateOrderStatus Fallback]:', err);
      }
    }

    const order = fallbackOrders.find(
      (o) => o.orderNumber === orderNumber && o.customerId.toString() === customerId.toString()
    );
    if (order) {
      order.status = status;
      order.updatedAt = now;
      if (status === 'cancelled') {
        order.cancelledAt = now;
        order.cancelReason = cancelReason || 'Customer requested cancellation';
      }
      return order;
    }

    return null;
  }

  /**
   * Reset fallback store
   */
  static clearFallbackStore(): void {
    fallbackOrders.length = 0;
  }
}
