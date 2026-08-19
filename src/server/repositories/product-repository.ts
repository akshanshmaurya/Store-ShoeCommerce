import { getStorefrontDb } from '../db/mongodb';
import { MOCK_PRODUCTS, CATEGORIES, BRANDS, COLLECTIONS } from '@/features/catalog/data/mock-products';
import { Product, AvailableFilters, FilterFacetOption, SearchSuggestionResult } from '@/features/catalog/types';
import { ValidatedCatalogQuery } from '../utils/validation';

export interface ProductQueryResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  facets: AvailableFilters;
}

export class ServerProductRepository {
  /**
   * Primary Catalog Query Engine
   */
  static async queryProducts(query: ValidatedCatalogQuery): Promise<ProductQueryResult> {
    const db = await getStorefrontDb();

    let allActiveProducts: Product[] = [];

    if (db) {
      try {
        const rawProducts = await db
          .collection('products')
          .find({ status: 'active', isActive: true })
          .toArray();

        if (rawProducts && rawProducts.length > 0) {
          const productIds = rawProducts.map((p) => p._id);
          const rawVariants = await db
            .collection('variants')
            .find(
              { productId: { $in: productIds }, status: 'active' },
              { projection: { costPrice: 0 } } // Strict security projection: exclude costPrice
            )
            .toArray();

          const brands = await db.collection('brands').find({}).toArray();
          const categories = await db.collection('categories').find({}).toArray();
          const collections = await db.collection('collections').find({}).toArray();

          const brandMap = new Map(brands.map((b) => [b._id.toString(), b]));
          const catMap = new Map(categories.map((c) => [c._id.toString(), c]));
          const colMap = new Map(collections.map((c) => [c._id.toString(), c]));

          allActiveProducts = rawProducts.map((p) => {
            const b = brandMap.get(p.brandId.toString());
            const cat = p.categoryIds && p.categoryIds[0] ? catMap.get(p.categoryIds[0].toString()) : null;
            const cols = (p.collectionIds || []).map((cid: any) => colMap.get(cid.toString())).filter(Boolean);
            const pVariants = rawVariants.filter((v) => v.productId.toString() === p._id.toString());

            return {
              id: p._id.toString(),
              name: p.name,
              slug: p.slug,
              brand: {
                id: b ? b._id.toString() : 'brand-veloce',
                name: b ? b.name : 'VELOCE',
                slug: b ? b.slug : 'veloce',
              },
              category: {
                id: cat ? cat._id.toString() : 'cat-default',
                name: cat ? cat.name : 'Footwear',
                slug: cat ? cat.slug : 'footwear',
                status: 'ACTIVE' as const,
              },
              collections: cols.map((c: any) => ({
                id: c._id.toString(),
                name: c.name,
                slug: c.slug,
              })),
              gender: (p.gender || 'UNISEX').toUpperCase() as any,
              shortDescription: p.shortDescription || p.description,
              description: p.description,
              material: p.material || 'Engineered Materials',
              media: (p.media || []).map((m: any) => ({
                id: m._id?.toString() || 'm-1',
                productId: p._id.toString(),
                type: (m.type || 'IMAGE').toUpperCase(),
                url: m.url,
                altText: m.altText || p.name,
                sortOrder: m.sortOrder || 0,
                role: (m.isPrimary ? 'PRIMARY' : 'SECONDARY') as any,
              })),
              basePriceMinor: pVariants[0]?.price || 24900,
              baseCompareAtPriceMinor: pVariants[0]?.compareAtPrice || undefined,
              currency: 'USD',
              status: 'ACTIVE' as const,
              tags: p.tags || [],
              variants: pVariants.map((v) => ({
                id: v._id.toString(),
                productId: p._id.toString(),
                sku: v.sku,
                size: {
                  id: `size-${v.size?.value}`,
                  system: v.size?.system || 'US',
                  value: v.size?.value || '10',
                  label: v.size?.display || `US ${v.size?.value}`,
                  sortOrder: parseFloat(v.size?.value || '10') * 10,
                },
                color: {
                  id: `color-${v.color?.name?.toLowerCase().replace(/\s+/g, '-')}`,
                  name: v.color?.name || 'Standard',
                  hex: v.color?.hex || '#000000',
                },
                priceMinor: v.price,
                compareAtPriceMinor: v.compareAtPrice || undefined,
                status: 'ACTIVE' as const,
                createdAt: v.createdAt ? v.createdAt.toISOString() : new Date().toISOString(),
                updatedAt: v.updatedAt ? v.updatedAt.toISOString() : new Date().toISOString(),
              })),
              createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
              updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
            };
          });
        }
      } catch (err) {
        console.warn('[MongoDB Product Query Fallback]:', err);
      }
    }

    if (allActiveProducts.length === 0) {
      allActiveProducts = MOCK_PRODUCTS.filter((p) => p.status === 'ACTIVE');
    }

    let items = [...allActiveProducts];

    // 1. Search filter
    if (query.search && query.search.trim()) {
      const terms = query.search.toLowerCase().trim().split(/\s+/);
      items = items.filter((p) => {
        const corpus = [
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
        return terms.every((t) => corpus.includes(t));
      });
    }

    // 2. Category
    if (query.categorySlugs && query.categorySlugs.length > 0) {
      items = items.filter((p) => query.categorySlugs!.includes(p.category.slug));
    }

    // 3. Collection
    if (query.collectionSlugs && query.collectionSlugs.length > 0) {
      items = items.filter((p) =>
        p.collections.some((c) => query.collectionSlugs!.includes(c.slug))
      );
    }

    // 4. Brand
    if (query.brandSlugs && query.brandSlugs.length > 0) {
      items = items.filter((p) => query.brandSlugs!.includes(p.brand.slug));
    }

    // 5. Gender
    if (query.genders && query.genders.length > 0) {
      const gNorm = query.genders.map((g) => g.toUpperCase());
      items = items.filter((p) => gNorm.includes(p.gender) || p.gender === 'UNISEX');
    }

    // 6. Sizes
    if (query.sizes && query.sizes.length > 0) {
      items = items.filter((p) =>
        p.variants.some((v) => v.status === 'ACTIVE' && query.sizes!.includes(v.size.value))
      );
    }

    // 7. Colors
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

    // 8. Price boundaries
    if (query.minPriceMinor !== undefined) {
      items = items.filter((p) => p.basePriceMinor >= query.minPriceMinor!);
    }
    if (query.maxPriceMinor !== undefined) {
      items = items.filter((p) => p.basePriceMinor <= query.maxPriceMinor!);
    }

    // 9. Sorting
    switch (query.sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.basePriceMinor - b.basePriceMinor);
        break;
      case 'price-desc':
        items.sort((a, b) => b.basePriceMinor - a.basePriceMinor);
        break;
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        break;
    }

    const facets = this.calculateFacets(allActiveProducts);

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / query.limit));
    const page = Math.min(query.page, totalPages);
    const startIndex = (page - 1) * query.limit;
    const paginated = items.slice(startIndex, startIndex + query.limit);

    return {
      items: paginated,
      total,
      page,
      limit: query.limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      facets,
    };
  }

  /**
   * Find product by unique slug
   */
  static async findBySlug(slug: string): Promise<Product | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const db = await getStorefrontDb();

    if (db) {
      try {
        const p = await db
          .collection('products')
          .findOne({ slug: cleanSlug, status: 'active', isActive: true });

        if (p) {
          const variants = await db
            .collection('variants')
            .find({ productId: p._id, status: 'active' }, { projection: { costPrice: 0 } })
            .toArray();

          const b = await db.collection('brands').findOne({ _id: p.brandId });
          const cat = p.categoryIds && p.categoryIds[0] ? await db.collection('categories').findOne({ _id: p.categoryIds[0] }) : null;
          const cols = await db.collection('collections').find({ _id: { $in: p.collectionIds || [] } }).toArray();

          return {
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            brand: {
              id: b ? b._id.toString() : 'brand-1',
              name: b ? b.name : 'VELOCE',
              slug: b ? b.slug : 'veloce',
            },
            category: {
              id: cat ? cat._id.toString() : 'cat-1',
              name: cat ? cat.name : 'Footwear',
              slug: cat ? cat.slug : 'footwear',
              status: 'ACTIVE' as const,
            },
            collections: cols.map((c: any) => ({
              id: c._id.toString(),
              name: c.name,
              slug: c.slug,
            })),
            gender: (p.gender || 'UNISEX').toUpperCase() as any,
            shortDescription: p.shortDescription || p.description,
            description: p.description,
            material: p.material || 'Engineered Materials',
            media: (p.media || []).map((m: any) => ({
              id: m._id?.toString() || 'm-1',
              productId: p._id.toString(),
              type: (m.type || 'IMAGE').toUpperCase(),
              url: m.url,
              altText: m.altText || p.name,
              sortOrder: m.sortOrder || 0,
              role: (m.isPrimary ? 'PRIMARY' : 'SECONDARY') as any,
            })),
            basePriceMinor: variants[0]?.price || 24900,
            baseCompareAtPriceMinor: variants[0]?.compareAtPrice || undefined,
            currency: 'USD',
            status: 'ACTIVE' as const,
            tags: p.tags || [],
            variants: variants.map((v) => ({
              id: v._id.toString(),
              productId: p._id.toString(),
              sku: v.sku,
              size: {
                id: `size-${v.size?.value}`,
                system: v.size?.system || 'US',
                value: v.size?.value || '10',
                label: v.size?.display || `US ${v.size?.value}`,
                sortOrder: parseFloat(v.size?.value || '10') * 10,
              },
              color: {
                id: `color-${v.color?.name?.toLowerCase().replace(/\s+/g, '-')}`,
                name: v.color?.name || 'Standard',
                hex: v.color?.hex || '#000000',
              },
              priceMinor: v.price,
              compareAtPriceMinor: v.compareAtPrice || undefined,
              status: 'ACTIVE' as const,
              createdAt: v.createdAt ? v.createdAt.toISOString() : new Date().toISOString(),
              updatedAt: v.updatedAt ? v.updatedAt.toISOString() : new Date().toISOString(),
            })),
            createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[MongoDB findBySlug Fallback]:', err);
      }
    }

    return MOCK_PRODUCTS.find((p) => p.slug.toLowerCase() === cleanSlug && p.status === 'ACTIVE') || null;
  }

  /**
   * Find product by ID
   */
  static async findById(productId: string): Promise<Product | null> {
    const pIdStr = productId.toString();
    const product = MOCK_PRODUCTS.find((p) => p.id === pIdStr && p.status === 'ACTIVE');
    if (product) return product;

    const res = await this.queryProducts({ page: 1, limit: 100, sortBy: 'featured' });
    return res.items.find((p) => p.id === pIdStr) || null;
  }

  /**
   * Find variant and its parent product by variant ID
   */
  static async findVariantById(variantId: string): Promise<{ product: Product; variant: any } | null> {
    const vIdStr = variantId.toString();

    // 1. Check in mock products
    for (const p of MOCK_PRODUCTS) {
      const v = p.variants.find((variant) => variant.id === vIdStr);
      if (v) {
        return { product: p, variant: v };
      }
    }

    // 2. Check in query products
    const res = await this.queryProducts({ page: 1, limit: 100, sortBy: 'featured' });
    for (const p of res.items) {
      const v = p.variants.find((variant) => variant.id === vIdStr);
      if (v) {
        return { product: p, variant: v };
      }
    }

    return null;
  }

  /**
   * Get all active products
   */
  static async getAllActiveProducts(): Promise<Product[]> {
    const res = await this.queryProducts({ page: 1, limit: 1000, sortBy: 'featured' });
    return res.items;
  }

  /**
   * Calculate filter facets
   */
  public static calculateFacets(allProducts: Product[]): AvailableFilters {
    const categories: FilterFacetOption[] = CATEGORIES.filter((c) => c.status === 'ACTIVE').map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      value: cat.slug,
      count: allProducts.filter((p) => p.category.slug === cat.slug).length,
    }));

    const brands: FilterFacetOption[] = BRANDS.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      value: b.slug,
      count: allProducts.filter((p) => p.brand.slug === b.slug).length,
    }));

    const collections: FilterFacetOption[] = COLLECTIONS.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      value: c.slug,
      count: allProducts.filter((p) => p.collections.some((col) => col.slug === c.slug)).length,
    }));

    const genders: FilterFacetOption<any>[] = [
      { id: 'gender-men', name: 'Men', slug: 'MEN', value: 'MEN', count: allProducts.filter((p) => p.gender === 'MEN' || p.gender === 'UNISEX').length },
      { id: 'gender-women', name: 'Women', slug: 'WOMEN', value: 'WOMEN', count: allProducts.filter((p) => p.gender === 'WOMEN' || p.gender === 'UNISEX').length },
      { id: 'gender-unisex', name: 'Unisex', slug: 'UNISEX', value: 'UNISEX', count: allProducts.filter((p) => p.gender === 'UNISEX').length },
    ];

    const sizesMap = new Map<string, { label: string; count: number; sortOrder: number }>();
    for (const p of allProducts) {
      for (const v of p.variants) {
        if (v.status === 'ACTIVE') {
          const val = v.size.value;
          if (!sizesMap.has(val)) {
            sizesMap.set(val, { label: v.size.label, count: 0, sortOrder: v.size.sortOrder });
          }
          sizesMap.get(val)!.count += 1;
        }
      }
    }

    const sizes = Array.from(sizesMap.entries())
      .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
      .map(([val, info]) => ({
        id: `size-${val}`,
        name: info.label,
        slug: val,
        value: val,
        count: info.count,
      }));

    const colorsMap = new Map<string, { name: string; hex: string; count: number }>();
    for (const p of allProducts) {
      for (const v of p.variants) {
        if (v.status === 'ACTIVE') {
          const colorKey = v.color.name.toLowerCase();
          if (!colorsMap.has(colorKey)) {
            colorsMap.set(colorKey, { name: v.color.name, hex: v.color.hex, count: 0 });
          }
          colorsMap.get(colorKey)!.count += 1;
        }
      }
    }

    const colors = Array.from(colorsMap.entries()).map(([key, info]) => ({
      id: `color-${key}`,
      name: info.name,
      slug: key,
      value: key,
      hex: info.hex,
      count: info.count,
    }));

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
   * Search suggestions
   */
  static async getSuggestions(keyword: string, limit: number = 4): Promise<SearchSuggestionResult> {
    if (!keyword || !keyword.trim()) {
      return { products: [], categories: [], collections: [], brands: [] };
    }

    const q = keyword.toLowerCase().trim();
    const matchingProducts = MOCK_PRODUCTS.filter(
      (p) =>
        p.status === 'ACTIVE' &&
        (p.name.toLowerCase().includes(q) ||
          p.brand.name.toLowerCase().includes(q) ||
          p.category.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)))
    ).slice(0, limit);

    return {
      products: matchingProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand.name,
        priceMinor: p.basePriceMinor,
        primaryImage: p.media.find((m) => m.role === 'PRIMARY')?.url || p.media[0]?.url || '',
        category: p.category.name,
      })),
      categories: CATEGORIES.filter((c) => c.status === 'ACTIVE' && c.name.toLowerCase().includes(q)).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: MOCK_PRODUCTS.filter((p) => p.category.slug === c.slug && p.status === 'ACTIVE').length,
      })),
      collections: COLLECTIONS.filter((c) => c.name.toLowerCase().includes(q)).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      brands: BRANDS.filter((b) => b.name.toLowerCase().includes(q)).map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
      })),
    };
  }
}
