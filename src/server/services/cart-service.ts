import { ServerCartRepository, CartDocument } from '../repositories/cart-repository';
import { ServerProductRepository } from '../repositories/product-repository';
import { ShoeColor, ShoeSize } from '@/features/catalog/types';
import { BadRequestError, NotFoundError } from '../utils/api-error';

export const MAX_CART_ITEM_QTY = 10;

export interface PopulatedCartItem {
  id: string; // `${productId}-${variantId}`
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  slug: string;
  brandName: string;
  primaryImage: string;
  selectedSize: ShoeSize;
  selectedColor: ShoeColor;
  unitPriceMinor: number;
  compareAtPriceMinor?: number;
  quantity: number;
  lineSubtotalMinor: number;
  currency: string;
  isAvailable: boolean;
}

export interface PopulatedCart {
  id: string;
  items: PopulatedCartItem[];
  totalItems: number;
  subtotalMinor: number;
  updatedAt: string;
  status: 'active' | 'abandoned' | 'converted';
}

export class CartService {
  /**
   * Populate a CartDocument with current product & variant catalog data
   */
  static async populateCart(cartDoc: CartDocument): Promise<PopulatedCart> {
    const populatedItems: PopulatedCartItem[] = [];
    let subtotalMinor = 0;
    let totalItems = 0;

    for (const item of cartDoc.items) {
      const vIdStr = item.variantId.toString();
      const match = await ServerProductRepository.findVariantById(vIdStr);

      if (match) {
        const { product, variant } = match;
        const primaryImage =
          product.media.find((m) => m.role === 'PRIMARY')?.url ||
          product.media[0]?.url ||
          '';

        const unitPriceMinor = variant.priceMinor || product.basePriceMinor;
        const lineSubtotalMinor = unitPriceMinor * item.quantity;
        const isAvailable = variant.status === 'ACTIVE' && product.status === 'ACTIVE';

        populatedItems.push({
          id: `${product.id}-${variant.id}`,
          productId: product.id,
          variantId: variant.id,
          sku: variant.sku,
          productName: product.name,
          slug: product.slug,
          brandName: product.brand.name,
          primaryImage,
          selectedSize: variant.size,
          selectedColor: variant.color,
          unitPriceMinor,
          compareAtPriceMinor: variant.compareAtPriceMinor,
          quantity: item.quantity,
          lineSubtotalMinor,
          currency: product.currency,
          isAvailable,
        });

        subtotalMinor += lineSubtotalMinor;
        totalItems += item.quantity;
      } else {
        // Retain unmapped/inactive item with degraded info so customer can remove it
        populatedItems.push({
          id: `item-${vIdStr}`,
          productId: item.productId?.toString() || 'unknown',
          variantId: vIdStr,
          sku: 'UNAVAILABLE',
          productName: 'Unavailable Product',
          slug: '',
          brandName: 'VELOCE',
          primaryImage: '',
          selectedSize: { id: 'size-10', system: 'US', value: '10', label: 'US 10', sortOrder: 1 },
          selectedColor: { id: 'color-std', name: 'Standard', hex: '#000000' },
          unitPriceMinor: 0,
          quantity: item.quantity,
          lineSubtotalMinor: 0,
          currency: 'USD',
          isAvailable: false,
        });
        totalItems += item.quantity;
      }
    }

    return {
      id: cartDoc._id.toString(),
      items: populatedItems,
      totalItems,
      subtotalMinor,
      updatedAt: cartDoc.updatedAt instanceof Date ? cartDoc.updatedAt.toISOString() : new Date().toISOString(),
      status: cartDoc.status,
    };
  }

  /**
   * Get active cart for session
   */
  static async getCart(session: { customerId?: string; guestId: string }): Promise<PopulatedCart> {
    const cartDoc = await ServerCartRepository.getOrCreateActive(session);
    return this.populateCart(cartDoc);
  }

  /**
   * Add item to active cart
   */
  static async addItem(
    session: { customerId?: string; guestId: string },
    input: {
      variantId: string;
      productId?: string;
      quantity?: number;
    }
  ): Promise<PopulatedCart> {
    if (!input.variantId) {
      throw new BadRequestError('Variant ID is required.');
    }

    const qty = input.quantity !== undefined ? input.quantity : 1;
    if (!Number.isInteger(qty) || qty < 1) {
      throw new BadRequestError('Quantity must be a positive whole number.');
    }

    if (qty > MAX_CART_ITEM_QTY) {
      throw new BadRequestError(`Cannot add more than ${MAX_CART_ITEM_QTY} units per cart item.`);
    }

    // Authoritative verification: look up variant & product from catalog
    const match = await ServerProductRepository.findVariantById(input.variantId);
    if (!match) {
      throw new NotFoundError('Selected product variant was not found.');
    }

    const { product, variant } = match;
    if (variant.status !== 'ACTIVE' || product.status !== 'ACTIVE') {
      throw new BadRequestError('This product variant is currently unavailable.');
    }

    // Verify product relationship if provided by client
    if (input.productId && input.productId !== product.id) {
      throw new BadRequestError('Variant does not belong to the specified product.');
    }

    const cartDoc = await ServerCartRepository.getOrCreateActive(session);
    const updatedCartDoc = await ServerCartRepository.addItem(
      cartDoc._id.toString(),
      {
        variantId: variant.id,
        productId: product.id,
        quantity: qty,
      },
      MAX_CART_ITEM_QTY
    );

    return this.populateCart(updatedCartDoc);
  }

  /**
   * Update quantity of a variant in active cart
   */
  static async updateQuantity(
    session: { customerId?: string; guestId: string },
    variantId: string,
    quantity: number
  ): Promise<PopulatedCart> {
    if (!variantId) {
      throw new BadRequestError('Variant ID is required.');
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestError('Quantity must be a positive integer greater than or equal to 1.');
    }

    if (quantity > MAX_CART_ITEM_QTY) {
      throw new BadRequestError(`Maximum quantity per item is ${MAX_CART_ITEM_QTY}.`);
    }

    const cartDoc = await ServerCartRepository.getOrCreateActive(session);
    const updated = await ServerCartRepository.updateQuantity(cartDoc._id.toString(), variantId, quantity);

    if (!updated) {
      throw new NotFoundError('Item not found in cart.');
    }

    return this.populateCart(updated);
  }

  /**
   * Remove item from active cart
   */
  static async removeItem(
    session: { customerId?: string; guestId: string },
    variantId: string
  ): Promise<PopulatedCart> {
    if (!variantId) {
      throw new BadRequestError('Variant ID is required.');
    }

    const cartDoc = await ServerCartRepository.getOrCreateActive(session);
    const updated = await ServerCartRepository.removeItem(cartDoc._id.toString(), variantId);

    if (!updated) {
      return this.populateCart(cartDoc);
    }

    return this.populateCart(updated);
  }

  /**
   * Clear all items in active cart
   */
  static async clearCart(session: { customerId?: string; guestId: string }): Promise<PopulatedCart> {
    const cartDoc = await ServerCartRepository.getOrCreateActive(session);
    const cleared = await ServerCartRepository.clearCart(cartDoc._id.toString());
    return this.populateCart(cleared || cartDoc);
  }

  /**
   * Merge guest cart into authenticated customer cart
   */
  static async mergeCarts(customerId: string, guestId: string): Promise<PopulatedCart> {
    if (!customerId) {
      throw new BadRequestError('Authenticated customer ID is required for cart merge.');
    }

    if (!guestId) {
      return this.getCart({ customerId, guestId: '' });
    }

    const guestCart = await ServerCartRepository.findActiveByGuestId(guestId);
    const customerCart = await ServerCartRepository.getOrCreateActive({ customerId, guestId });

    if (!guestCart || guestCart.items.length === 0) {
      return this.populateCart(customerCart);
    }

    // Merge each item from guest cart into customer cart
    for (const item of guestCart.items) {
      await ServerCartRepository.addItem(
        customerCart._id.toString(),
        {
          variantId: item.variantId.toString(),
          productId: item.productId.toString(),
          quantity: item.quantity,
        },
        MAX_CART_ITEM_QTY
      );
    }

    // Deactivate guest cart
    await ServerCartRepository.deactivateGuestCart(guestId);

    // Return fresh populated customer cart
    const refreshedCustomerCart = await ServerCartRepository.findById(customerCart._id.toString());
    return this.populateCart(refreshedCustomerCart || customerCart);
  }
}
