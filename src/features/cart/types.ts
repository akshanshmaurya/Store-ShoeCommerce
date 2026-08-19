import { ShoeColor, ShoeSize } from "../catalog/types";

/**
 * Canonical Cart Domain Types
 * Phase 5 — Cart & Wishlist Foundation
 * Aligned with AGENTS.md & docs/domain-model.md
 */

export interface CartItem {
  id: string; // Unique cart line identifier: `${productId}-${variantId}`
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  slug: string;
  brandName: string;
  primaryImage: string;
  selectedSize: ShoeSize;
  selectedColor: ShoeColor;
  unitPriceMinor: number; // Exact minor integer currency (e.g. 24900 = $249.00)
  compareAtPriceMinor?: number;
  quantity: number;
  currency: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number; // Total units across all lines (sum of quantities)
  subtotalMinor: number; // Sum of (unitPriceMinor * quantity)
  updatedAt: string;
  version: number;
}
