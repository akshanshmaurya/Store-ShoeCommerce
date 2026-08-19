/**
 * Canonical Domain Types for Storefront
 * Aligned strictly with docs/domain-model.md and AGENTS.md
 */

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  basePriceMinor: number; // Stored in minor units (e.g. cents)
  currency: string;
  images: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  color: string;
  colorCode: string;
  size: string;
  priceMinor: number;
  availableStock: number;
  isAvailable: boolean;
  images: string[];
}

export interface CartItem {
  id: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPriceMinor: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotalMinor: number;
  currency: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';
