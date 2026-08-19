import {
  Product,
  Category,
  Brand,
  Collection,
  ProductCardData,
  CatalogQuery,
  CatalogResult,
  AvailableFilters,
  FilterFacetOption,
  SearchSuggestionResult,
  GenderCategory,
} from '../types';
import { MOCK_PRODUCTS, CATEGORIES, BRANDS, COLLECTIONS } from './mock-products';

// Enforce runtime uniqueness of slugs and SKUs on data layer initialization
function validateCatalogIntegrity(products: Product[]): void {
  const seenSlugs = new Set<string>();
  const seenSkus = new Set<string>();

  for (const product of products) {
    if (seenSlugs.has(product.slug)) {
      throw new Error(`Catalog Integrity Error: Duplicate product slug found "${product.slug}"`);
    }
    seenSlugs.add(product.slug);

    for (const variant of product.variants) {
      if (seenSkus.has(variant.sku)) {
        throw new Error(`Catalog Integrity Error: Duplicate SKU found "${variant.sku}"`);
      }
      seenSkus.add(variant.sku);
    }
  }
}

// Run validation once
validateCatalogIntegrity(MOCK_PRODUCTS);

export class ProductRepository {
  /**
   * Comprehensive Product Query & Dynamic Filter Engine (Phase 4)
   */
  static async queryProducts(query: CatalogQuery = {}): Promise<CatalogResult> {
    const allActive = MOCK_PRODUCTS.filter((p) => p.status === 'ACTIVE');
    let items = [...allActive];

    // 1. Full-text / Partial Keyword Search
    if (query.search && query.search.trim()) {
      const searchTerms = query.search.toLowerCase().trim().split(/\s+/);
      items = items.filter((p) => {
        const searchableCorpus = [
          p.name,
          p.brand.name,
          p.category.name,
          ...p.collections.map((c) => c.name),
          p.material,
          ...p.tags,
          p.shortDescription,
          p.description,
        ]
          .join(' ')
          .toLowerCase();

        return searchTerms.every((term) => searchableCorpus.includes(term));
      });
    }

    // 2. Category Filter
    if (query.categorySlugs && query.categorySlugs.length > 0) {
      items = items.filter((p) => query.categorySlugs!.includes(p.category.slug));
    }

    // 3. Collection Filter
    if (query.collectionSlugs && query.collectionSlugs.length > 0) {
      items = items.filter((p) =>
        p.collections.some((c) => query.collectionSlugs!.includes(c.slug))
      );
    }

    // 4. Brand Filter
    if (query.brandSlugs && query.brandSlugs.length > 0) {
      items = items.filter((p) => query.brandSlugs!.includes(p.brand.slug));
    }

    // 5. Gender Filter
    if (query.genders && query.genders.length > 0) {
      items = items.filter(
        (p) => query.genders!.includes(p.gender) || p.gender === 'UNISEX'
      );
    }

    // 6. Sizing Filter (matches any variant in product)
    if (query.sizes && query.sizes.length > 0) {
      items = items.filter((p) =>
        p.variants.some(
          (v) => v.status === 'ACTIVE' && query.sizes!.includes(v.size.value)
        )
      );
    }

    // 7. Color Filter (matches any variant color name or ID or hex)
    if (query.colors && query.colors.length > 0) {
      items = items.filter((p) =>
        p.variants.some(
          (v) =>
            v.status === 'ACTIVE' &&
            query.colors!.some(
              (c) =>
                c.toLowerCase() === v.color.id.toLowerCase() ||
                v.color.name.toLowerCase().includes(c.toLowerCase())
            )
        )
      );
    }

    // 8. Price Boundaries
    if (query.minPriceMinor !== undefined) {
      items = items.filter((p) => p.basePriceMinor >= query.minPriceMinor!);
    }
    if (query.maxPriceMinor !== undefined) {
      items = items.filter((p) => p.basePriceMinor <= query.maxPriceMinor!);
    }

    // 9. Sorting
    const sort = query.sortBy || 'featured';
    switch (sort) {
      case 'price-asc':
        items.sort((a, b) => a.basePriceMinor - b.basePriceMinor);
        break;
      case 'price-desc':
        items.sort((a, b) => b.basePriceMinor - a.basePriceMinor);
        break;
      case 'newest':
        items.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // Preserves default curated order
        break;
    }

    // 10. Dynamic Filter Facets Aggregation
    const availableFilters = this.calculateAvailableFilters(allActive, items);

    // 11. Pagination
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, query.pageSize || 9);
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = items.slice(startIndex, startIndex + pageSize);

    return {
      products: paginatedProducts,
      total,
      page,
      pageSize,
      totalPages,
      availableFilters,
    };
  }

  /**
   * Dynamically calculate available filter options and counts
   */
  private static calculateAvailableFilters(
    allProducts: Product[],
    filteredProducts: Product[]
  ): AvailableFilters {
    // Categories
    const categories: FilterFacetOption[] = CATEGORIES.filter((c) => c.status === 'ACTIVE').map(
      (cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        value: cat.slug,
        count: allProducts.filter((p) => p.category.slug === cat.slug).length,
      })
    );

    // Brands
    const brands: FilterFacetOption[] = BRANDS.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      value: b.slug,
      count: allProducts.filter((p) => p.brand.slug === b.slug).length,
    }));

    // Collections
    const collections: FilterFacetOption[] = COLLECTIONS.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      value: c.slug,
      count: allProducts.filter((p) => p.collections.some((col) => col.slug === c.slug)).length,
    }));

    // Genders
    const genders: FilterFacetOption<GenderCategory>[] = [
      {
        id: 'gender-men',
        name: 'Men',
        slug: 'MEN',
        value: 'MEN',
        count: allProducts.filter((p) => p.gender === 'MEN' || p.gender === 'UNISEX').length,
      },
      {
        id: 'gender-women',
        name: 'Women',
        slug: 'WOMEN',
        value: 'WOMEN',
        count: allProducts.filter((p) => p.gender === 'WOMEN' || p.gender === 'UNISEX').length,
      },
      {
        id: 'gender-unisex',
        name: 'Unisex',
        slug: 'UNISEX',
        value: 'UNISEX',
        count: allProducts.filter((p) => p.gender === 'UNISEX').length,
      },
    ];

    // Sizes
    const sizesMap = new Map<string, { label: string; count: number; sortOrder: number }>();
    for (const p of allProducts) {
      for (const v of p.variants) {
        if (v.status === 'ACTIVE') {
          const val = v.size.value;
          if (!sizesMap.has(val)) {
            sizesMap.set(val, {
              label: v.size.label,
              count: 0,
              sortOrder: v.size.sortOrder,
            });
          }
          sizesMap.get(val)!.count += 1;
        }
      }
    }

    const sizes: FilterFacetOption[] = Array.from(sizesMap.entries())
      .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
      .map(([val, info]) => ({
        id: `size-${val}`,
        name: info.label,
        slug: val,
        value: val,
        count: info.count,
      }));

    // Colors
    const colorsMap = new Map<string, { name: string; hex: string; count: number }>();
    for (const p of allProducts) {
      for (const v of p.variants) {
        if (v.status === 'ACTIVE') {
          const colorKey = v.color.name.toLowerCase();
          if (!colorsMap.has(colorKey)) {
            colorsMap.set(colorKey, {
              name: v.color.name,
              hex: v.color.hex,
              count: 0,
            });
          }
          colorsMap.get(colorKey)!.count += 1;
        }
      }
    }

    const colors: FilterFacetOption[] = Array.from(colorsMap.entries()).map(
      ([key, info]) => ({
        id: `color-${key}`,
        name: info.name,
        slug: key,
        value: key,
        hex: info.hex,
        count: info.count,
      })
    );

    // Min / Max Price
    let minPrice = Infinity;
    let maxPrice = 0;
    for (const p of allProducts) {
      if (p.basePriceMinor < minPrice) minPrice = p.basePriceMinor;
      if (p.basePriceMinor > maxPrice) maxPrice = p.basePriceMinor;
    }

    return {
      categories,
      brands,
      collections,
      genders,
      sizes,
      colors,
      priceRange: {
        minPriceMinor: minPrice === Infinity ? 0 : minPrice,
        maxPriceMinor: maxPrice,
      },
    };
  }

  /**
   * Instant Search Suggestions for Autocomplete Modals & Quick Search
   */
  static async getSearchSuggestions(
    keyword: string,
    limit: number = 4
  ): Promise<SearchSuggestionResult> {
    if (!keyword || !keyword.trim()) {
      return { products: [], categories: [], collections: [], brands: [] };
    }

    const q = keyword.toLowerCase().trim();

    // Matching Products
    const matchingProducts = MOCK_PRODUCTS.filter(
      (p) =>
        p.status === 'ACTIVE' &&
        (p.name.toLowerCase().includes(q) ||
          p.brand.name.toLowerCase().includes(q) ||
          p.category.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)))
    ).slice(0, limit);

    const products = matchingProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand.name,
      priceMinor: p.basePriceMinor,
      primaryImage: p.media.find((m) => m.role === 'PRIMARY')?.url || p.media[0]?.url || '',
      category: p.category.name,
    }));

    // Matching Categories
    const categories = CATEGORIES.filter(
      (c) => c.status === 'ACTIVE' && c.name.toLowerCase().includes(q)
    ).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: MOCK_PRODUCTS.filter((p) => p.category.slug === c.slug && p.status === 'ACTIVE').length,
    }));

    // Matching Collections
    const collections = COLLECTIONS.filter((c) => c.name.toLowerCase().includes(q)).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));

    // Matching Brands
    const brands = BRANDS.filter((b) => b.name.toLowerCase().includes(q)).map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
    }));

    return {
      products,
      categories,
      collections,
      brands,
    };
  }

  /**
   * Backwards-compatible getProducts method for existing callers
   */
  static async getProducts(filter?: {
    categorySlug?: string;
    collectionSlug?: string;
    brandSlug?: string;
    gender?: GenderCategory;
    minPriceMinor?: number;
    maxPriceMinor?: number;
    sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  }): Promise<Product[]> {
    const result = await this.queryProducts({
      categorySlugs: filter?.categorySlug ? [filter.categorySlug] : undefined,
      collectionSlugs: filter?.collectionSlug ? [filter.collectionSlug] : undefined,
      brandSlugs: filter?.brandSlug ? [filter.brandSlug] : undefined,
      genders: filter?.gender ? [filter.gender] : undefined,
      minPriceMinor: filter?.minPriceMinor,
      maxPriceMinor: filter?.maxPriceMinor,
      sortBy: filter?.sortBy,
      pageSize: 100, // Return all for legacy caller
    });
    return result.products;
  }

  /**
   * Fetch a single product by unique URL slug
   */
  static async getProductBySlug(slug: string): Promise<Product | null> {
    const product = MOCK_PRODUCTS.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() && p.status === 'ACTIVE'
    );
    return product || null;
  }

  /**
   * Fetch featured products for the storefront homepage
   */
  static async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    return MOCK_PRODUCTS.filter((p) => p.status === 'ACTIVE').slice(0, limit);
  }

  /**
   * Fetch all categories
   */
  static async getCategories(): Promise<Category[]> {
    return CATEGORIES.filter((c) => c.status === 'ACTIVE');
  }

  /**
   * Fetch single category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cat = CATEGORIES.find((c) => c.slug === slug && c.status === 'ACTIVE');
    return cat || null;
  }

  /**
   * Fetch all brands
   */
  static async getBrands(): Promise<Brand[]> {
    return BRANDS;
  }

  /**
   * Fetch all collections
   */
  static async getCollections(): Promise<Collection[]> {
    return COLLECTIONS;
  }

  /**
   * Transform full Product entity into lightweight ProductCardData
   */
  static toProductCardData(product: Product): ProductCardData {
    const primaryMedia =
      product.media.find((m) => m.role === 'PRIMARY') || product.media[0];
    const secondaryMedia = product.media.find((m) => m.role === 'SECONDARY');

    // Extract unique colors available across variants
    const colorsMap = new Map();
    for (const v of product.variants) {
      if (v.status === 'ACTIVE' && !colorsMap.has(v.color.id)) {
        colorsMap.set(v.color.id, v.color);
      }
    }

    // Extract unique sizes
    const sizesSet = new Set(
      product.variants.filter((v) => v.status === 'ACTIVE').map((v) => v.size.id)
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brand.name,
      categoryName: product.category.name,
      primaryImageUrl: primaryMedia ? primaryMedia.url : '',
      secondaryImageUrl: secondaryMedia ? secondaryMedia.url : undefined,
      priceMinor: product.basePriceMinor,
      compareAtPriceMinor: product.baseCompareAtPriceMinor,
      currency: product.currency,
      badge: product.badge,
      colors: Array.from(colorsMap.values()),
      availableSizesCount: sizesSet.size,
    };
  }
}
