/**
 * Canonical Wishlist Domain Types
 * Phase 5 — Cart & Wishlist Foundation
 * Aligned with AGENTS.md & docs/domain-model.md
 */

export interface WishlistItem {
  productId: string;
  productName: string;
  slug: string;
  brandName: string;
  primaryImage: string;
  basePriceMinor: number;
  compareAtPriceMinor?: number;
  currency: string;
  badge?: 'NEW' | 'BEST SELLER' | 'LIMITED' | 'SALE';
  categoryName?: string;
  addedAt: string; // ISO 8601 UTC
}

export interface Wishlist {
  items: WishlistItem[];
  totalItems: number;
  updatedAt: string;
  version: number;
}
