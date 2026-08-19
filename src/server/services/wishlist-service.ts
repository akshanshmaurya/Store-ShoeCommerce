import { ServerWishlistRepository, WishlistDocument } from '../repositories/wishlist-repository';
import { ServerProductRepository } from '../repositories/product-repository';
import { BadRequestError, NotFoundError } from '../utils/api-error';

export interface PopulatedWishlistItem {
  productId: string;
  variantId?: string | null;
  productName: string;
  slug: string;
  brandName: string;
  primaryImage: string;
  basePriceMinor: number;
  compareAtPriceMinor?: number;
  currency: string;
  badge?: string;
  categoryName: string;
  addedAt: string;
}

export interface PopulatedWishlist {
  id: string;
  customerId: string;
  items: PopulatedWishlistItem[];
  totalItems: number;
  updatedAt: string;
}

export class WishlistService {
  /**
   * Populate WishlistDocument with catalog product metadata
   */
  static async populateWishlist(doc: WishlistDocument): Promise<PopulatedWishlist> {
    const populatedItems: PopulatedWishlistItem[] = [];

    for (const item of doc.items) {
      const pIdStr = item.productId.toString();
      const product = await ServerProductRepository.findById(pIdStr);

      if (product) {
        const primaryImage =
          product.media.find((m) => m.role === 'PRIMARY')?.url ||
          product.media[0]?.url ||
          '';

        populatedItems.push({
          productId: product.id,
          variantId: item.variantId ? item.variantId.toString() : null,
          productName: product.name,
          slug: product.slug,
          brandName: product.brand.name,
          primaryImage,
          basePriceMinor: product.basePriceMinor,
          compareAtPriceMinor: product.baseCompareAtPriceMinor,
          currency: product.currency,
          badge: product.badge,
          categoryName: product.category.name,
          addedAt: item.addedAt instanceof Date ? item.addedAt.toISOString() : new Date().toISOString(),
        });
      }
    }

    return {
      id: doc._id.toString(),
      customerId: doc.customerId.toString(),
      items: populatedItems,
      totalItems: populatedItems.length,
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Get customer wishlist
   */
  static async getWishlist(customerId: string): Promise<PopulatedWishlist> {
    const doc = await ServerWishlistRepository.getOrCreate(customerId);
    return this.populateWishlist(doc);
  }

  /**
   * Add product to customer wishlist
   */
  static async addItem(customerId: string, productId: string, variantId?: string): Promise<PopulatedWishlist> {
    if (!productId) {
      throw new BadRequestError('Product ID is required.');
    }

    const product = await ServerProductRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    const updatedDoc = await ServerWishlistRepository.addItem(customerId, productId, variantId);
    return this.populateWishlist(updatedDoc);
  }

  /**
   * Remove product from customer wishlist
   */
  static async removeItem(customerId: string, productId: string): Promise<PopulatedWishlist> {
    if (!productId) {
      throw new BadRequestError('Product ID is required.');
    }

    const updatedDoc = await ServerWishlistRepository.removeItem(customerId, productId);
    if (!updatedDoc) {
      return this.getWishlist(customerId);
    }

    return this.populateWishlist(updatedDoc);
  }

  /**
   * Clear customer wishlist
   */
  static async clearWishlist(customerId: string): Promise<PopulatedWishlist> {
    await ServerWishlistRepository.clearWishlist(customerId);
    return this.getWishlist(customerId);
  }
}
