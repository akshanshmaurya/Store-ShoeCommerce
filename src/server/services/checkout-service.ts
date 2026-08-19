import crypto from 'crypto';
import { ServerCustomerRepository } from '../repositories/customer-repository';
import { ServerAddressRepository } from '../repositories/address-repository';
import { ServerCartRepository } from '../repositories/cart-repository';
import { ServerProductRepository } from '../repositories/product-repository';
import { ServerInventoryReservationRepository } from '../repositories/inventory-reservation-repository';
import { ServerOrderRepository, OrderDocument, OrderItemSnapshot, OrderAddressSnapshot } from '../repositories/order-repository';
import { BadRequestError, NotFoundError } from '../utils/api-error';

export interface CheckoutInput {
  shippingAddressId: string;
  billingAddressId?: string;
  idempotencyKey?: string;
  notes?: string;
}

export interface SanitizedOrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  itemCount: number;
  items: Array<{
    productId: string;
    variantId: string;
    productName: string;
    productSlug: string;
    sku: string;
    size: string;
    color: string;
    imageUrl?: string | null;
    unitPrice: number;
    orderedQuantity: number;
    lineTotal: number;
  }>;
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  placedAt: string;
  createdAt: string;
}

export function sanitizeOrder(order: OrderDocument): SanitizedOrderResponse {
  const itemCount = order.items.reduce((sum, item) => sum + item.orderedQuantity, 0);

  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    currency: order.currency,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    taxTotal: order.taxTotal,
    total: order.total,
    itemCount,
    items: order.items.map((i) => ({
      productId: i.productId.toString(),
      variantId: i.variantId.toString(),
      productName: i.productName,
      productSlug: i.productSlug,
      sku: i.sku,
      size: i.size,
      color: i.color,
      imageUrl: i.imageUrl,
      unitPrice: i.unitPrice,
      orderedQuantity: i.orderedQuantity,
      lineTotal: i.lineTotal,
    })),
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    placedAt: order.placedAt instanceof Date ? order.placedAt.toISOString() : order.placedAt,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
  };
}

export class CheckoutService {
  /**
   * Process authenticated customer checkout and create order
   */
  static async processCheckout(
    customerId: string,
    input: CheckoutInput
  ): Promise<SanitizedOrderResponse> {
    if (!customerId) {
      throw new BadRequestError('Authentication required to complete checkout.');
    }

    if (!input.shippingAddressId) {
      throw new BadRequestError('Shipping address is required.');
    }

    // 1. Check idempotency
    const idempotencyKey = input.idempotencyKey?.trim() || crypto.randomUUID();
    const existingOrder = await ServerOrderRepository.findByIdempotencyKey(idempotencyKey, customerId);
    if (existingOrder) {
      return sanitizeOrder(existingOrder);
    }

    // 2. Authenticate customer record
    const customer = await ServerCustomerRepository.findById(customerId);
    if (!customer || customer.status !== 'active') {
      throw new BadRequestError('Account is inactive or suspended.');
    }

    // 3. Authorize and load addresses
    const shippingAddrDoc = await ServerAddressRepository.findById(input.shippingAddressId, customerId);
    if (!shippingAddrDoc) {
      throw new BadRequestError('Invalid shipping address or address does not belong to this account.');
    }

    let billingAddrDoc = shippingAddrDoc;
    if (input.billingAddressId && input.billingAddressId !== input.shippingAddressId) {
      const bDoc = await ServerAddressRepository.findById(input.billingAddressId, customerId);
      if (!bDoc) {
        throw new BadRequestError('Invalid billing address or address does not belong to this account.');
      }
      billingAddrDoc = bDoc;
    }

    const shippingAddress: OrderAddressSnapshot = {
      recipientName: shippingAddrDoc.recipientName,
      phone: shippingAddrDoc.phone || customer.phone || '',
      line1: shippingAddrDoc.line1,
      line2: shippingAddrDoc.line2 || null,
      city: shippingAddrDoc.city,
      state: shippingAddrDoc.state,
      postalCode: shippingAddrDoc.postalCode,
      country: shippingAddrDoc.country,
    };

    const billingAddress: OrderAddressSnapshot = {
      recipientName: billingAddrDoc.recipientName,
      phone: billingAddrDoc.phone || customer.phone || '',
      line1: billingAddrDoc.line1,
      line2: billingAddrDoc.line2 || null,
      city: billingAddrDoc.city,
      state: billingAddrDoc.state,
      postalCode: billingAddrDoc.postalCode,
      country: billingAddrDoc.country,
    };

    // 4. Load active customer cart
    const cart = await ServerCartRepository.findActiveByCustomerId(customerId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestError('Your cart is empty. Please add items before checking out.');
    }

    // 5. Authoritatively re-validate items against live catalog and compute minor-unit prices
    const orderItems: OrderItemSnapshot[] = [];
    let subtotal = 0;
    let currency = 'USD';

    for (const cartItem of cart.items) {
      const vIdStr = cartItem.variantId.toString();
      const match = await ServerProductRepository.findVariantById(vIdStr);

      if (!match) {
        throw new BadRequestError(`Product variant ${vIdStr} is no longer available.`);
      }

      const { product, variant } = match;
      if (product.status !== 'ACTIVE' || variant.status !== 'ACTIVE') {
        throw new BadRequestError(`"${product.name}" is currently inactive and cannot be purchased.`);
      }

      const unitPrice = variant.priceMinor || product.basePriceMinor;
      const lineTotal = unitPrice * cartItem.quantity;
      currency = product.currency || 'USD';

      const primaryImage =
        product.media.find((m) => m.role === 'PRIMARY')?.url ||
        product.media[0]?.url ||
        null;

      orderItems.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        productSlug: product.slug,
        sku: variant.sku,
        size: variant.size.display || variant.size.label || variant.size.value,
        color: variant.color.name,
        imageUrl: primaryImage,
        unitPrice,
        compareAtPrice: variant.compareAtPriceMinor,
        orderedQuantity: cartItem.quantity,
        cancelledQuantity: 0,
        fulfilledQuantity: 0,
        returnedQuantity: 0,
        lineTotal,
        lineDiscount: 0,
        fulfillmentStatus: 'unfulfilled',
      });

      subtotal += lineTotal;
    }

    // Financial totals in minor units
    const discountTotal = 0;
    const shippingTotal = 0; // Free Standard Courier Delivery
    const taxTotal = Math.round(subtotal * 0.08); // 8% tax in integer minor units
    const total = subtotal - discountTotal + shippingTotal + taxTotal;

    // 6. Atomically reserve inventory for all items
    const acquiredReservationKeys: string[] = [];
    try {
      for (const item of orderItems) {
        const resKey = `res_${idempotencyKey.substring(0, 16)}_${item.variantId}`;
        await ServerInventoryReservationRepository.reserveStock(
          item.variantId.toString(),
          item.orderedQuantity,
          resKey,
          customerId
        );
        acquiredReservationKeys.push(resKey);
      }
    } catch (err: any) {
      // Roll back partial reservations on failure
      for (const key of acquiredReservationKeys) {
        await ServerInventoryReservationRepository.releaseReservation(key, 'Checkout reservation rollback');
      }
      throw new BadRequestError(
        err.message || 'One or more items in your cart could not be reserved due to insufficient inventory.'
      );
    }

    // 7. Generate order number & create order record
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${datePrefix}-${randomSuffix}`;
    const now = new Date();

    const orderDoc = await ServerOrderRepository.create({
      orderNumber,
      idempotencyKey,
      customerId,
      customerEmail: customer.email,
      customerPhone: customer.phone || shippingAddress.phone,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      currency,
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      total,
      shippingAddress,
      billingAddress,
      items: orderItems,
      reservationKeys: acquiredReservationKeys,
      discounts: [],
      source: 'web',
      notes: input.notes?.trim() || null,
      placedAt: now,
    });

    // 8. Associate reservations with created order
    for (const key of acquiredReservationKeys) {
      await ServerInventoryReservationRepository.associateWithOrder(key, orderDoc._id.toString());
    }

    // 9. Clear customer's active cart
    await ServerCartRepository.clearCart(cart._id.toString());

    return sanitizeOrder(orderDoc);
  }
}
