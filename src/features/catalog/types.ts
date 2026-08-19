/**
 * Canonical Product Domain Models & Types
 * Phase 4 — Product Discovery, Search & Filtering Foundation
 * Strictly aligned with AGENTS.md & docs/domain-model.md
 */

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type GenderCategory = 'MEN' | 'WOMEN' | 'UNISEX';

export type SizingSystem = 'US' | 'UK' | 'EU';

export interface ShoeSize {
  id: string;
  system: SizingSystem;
  value: string; // e.g. "9", "9.5", "10"
  label: string; // e.g. "US 9.0"
  sortOrder: number;
}

export interface ShoeColor {
  id: string;
  name: string; // e.g. "Obsidian Black", "Triple White", "Saffron Gold"
  hex: string;  // e.g. "#111111", "#F5F5F5", "#C9A96E"
  swatchUrl?: string;
}

export type ProductMediaRole = 'PRIMARY' | 'SECONDARY' | 'LIFESTYLE' | 'DETAIL' | 'SOLE' | 'OTHER';

export interface ProductMedia {
  id: string;
  productId: string;
  url: string;
  altText: string;
  sortOrder: number;
  role: ProductMediaRole;
  variantId?: string; // Optional linkage to specific color variant
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string; // Globally unique SKU (e.g. "VEL-AUR-BLK-090")
  size: ShoeSize;
  color: ShoeColor;
  priceMinor: number; // Exact minor integer currency (e.g. 24900 = $249.00)
  compareAtPriceMinor?: number; // Optional comparison price (e.g. 29900 = $299.00)
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string; // Unique URL slug
  brand: Brand;
  category: Category;
  collections: Collection[];
  gender: GenderCategory;
  shortDescription: string;
  description: string;
  material: string;
  status: ProductStatus;
  badge?: 'NEW' | 'BEST SELLER' | 'LIMITED' | 'SALE';
  tags: string[];
  media: ProductMedia[];
  variants: ProductVariant[];
  basePriceMinor: number;
  baseCompareAtPriceMinor?: number;
  currency: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// UI projection types
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  categoryName: string;
  primaryImageUrl: string;
  secondaryImageUrl?: string;
  priceMinor: number;
  compareAtPriceMinor?: number;
  currency: string;
  badge?: 'NEW' | 'BEST SELLER' | 'LIMITED' | 'SALE';
  colors: ShoeColor[];
  availableSizesCount: number;
}

// Phase 4 Catalog Discovery, Query & Filter Types
export type CatalogSortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc';

export interface CatalogQuery {
  search?: string;
  categorySlugs?: string[];
  collectionSlugs?: string[];
  brandSlugs?: string[];
  genders?: GenderCategory[];
  sizes?: string[]; // e.g. ["9", "9.5", "10"]
  colors?: string[]; // e.g. ["black", "gold", "white"] or color IDs
  minPriceMinor?: number;
  maxPriceMinor?: number;
  priceTier?: string; // e.g. 'under-250', '250-350', '350-plus'
  sortBy?: CatalogSortOption;
  page?: number;
  pageSize?: number;
}

export interface FilterFacetOption<T = string> {
  id: string;
  name: string;
  slug: string;
  count: number;
  value: T;
  hex?: string;
}

export interface AvailableFilters {
  categories: FilterFacetOption[];
  collections: FilterFacetOption[];
  brands: FilterFacetOption[];
  genders: FilterFacetOption<GenderCategory>[];
  sizes: FilterFacetOption[];
  colors: FilterFacetOption[];
  priceRange: {
    minPriceMinor: number;
    maxPriceMinor: number;
  };
}

export interface CatalogResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableFilters: AvailableFilters;
}

export interface SearchSuggestionResult {
  products: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    priceMinor: number;
    primaryImage: string;
    category: string;
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
    count: number;
  }[];
  collections: {
    id: string;
    name: string;
    slug: string;
  }[];
  brands: {
    id: string;
    name: string;
    slug: string;
  }[];
}
