import { BadRequestError } from './api-error';

export interface ValidatedCatalogQuery {
  search?: string;
  categorySlugs?: string[];
  collectionSlugs?: string[];
  brandSlugs?: string[];
  genders?: string[];
  sizes?: string[];
  colors?: string[];
  minPriceMinor?: number;
  maxPriceMinor?: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc';
  page: number;
  limit: number;
}

const ALLOWED_SORTS = ['featured', 'price-asc', 'price-desc', 'newest', 'name-asc'] as const;
const ALLOWED_GENDERS = ['men', 'women', 'unisex', 'kids', 'MEN', 'WOMEN', 'UNISEX', 'KIDS'] as const;

export function parseArrayParam(param: string | null): string[] | undefined {
  if (!param || !param.trim()) return undefined;
  return param
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function parsePositiveInt(val: string | null, fieldName: string, defaultVal?: number): number {
  if (!val) {
    if (defaultVal !== undefined) return defaultVal;
    throw new BadRequestError(`${fieldName} is required.`);
  }
  const parsed = parseInt(val, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new BadRequestError(`${fieldName} must be a positive integer.`);
  }
  return parsed;
}

export function validateCatalogQuery(searchParams: URLSearchParams): ValidatedCatalogQuery {
  // Page & Limit bounds
  const rawPage = searchParams.get('page');
  const page = rawPage ? parsePositiveInt(rawPage, 'page', 1) : 1;

  const rawLimit = searchParams.get('limit') || searchParams.get('pageSize');
  let limit = rawLimit ? parsePositiveInt(rawLimit, 'limit', 12) : 12;
  if (limit > 50) {
    limit = 50; // Bound maximum limit
  }

  // Sort
  const rawSort = searchParams.get('sort') || searchParams.get('sortBy') || 'featured';
  if (!ALLOWED_SORTS.includes(rawSort as any)) {
    throw new BadRequestError(
      `Invalid sort parameter: "${rawSort}". Allowed values: ${ALLOWED_SORTS.join(', ')}`
    );
  }
  const sortBy = rawSort as ValidatedCatalogQuery['sortBy'];

  // Genders
  const rawGenders = parseArrayParam(searchParams.get('gender') || searchParams.get('genders'));
  if (rawGenders) {
    for (const g of rawGenders) {
      if (!ALLOWED_GENDERS.includes(g as any)) {
        throw new BadRequestError(
          `Invalid gender filter: "${g}". Allowed values: men, women, unisex, kids`
        );
      }
    }
  }

  // Prices
  const rawMinPrice = searchParams.get('minPrice') || searchParams.get('minPriceMinor');
  let minPriceMinor: number | undefined;
  if (rawMinPrice) {
    const p = parseInt(rawMinPrice, 10);
    if (isNaN(p) || p < 0) throw new BadRequestError('minPrice must be a non-negative integer.');
    minPriceMinor = p;
  }

  const rawMaxPrice = searchParams.get('maxPrice') || searchParams.get('maxPriceMinor');
  let maxPriceMinor: number | undefined;
  if (rawMaxPrice) {
    const p = parseInt(rawMaxPrice, 10);
    if (isNaN(p) || p < 0) throw new BadRequestError('maxPrice must be a non-negative integer.');
    if (minPriceMinor !== undefined && p < minPriceMinor) {
      throw new BadRequestError('maxPrice cannot be less than minPrice.');
    }
    maxPriceMinor = p;
  }

  return {
    search: searchParams.get('search') || searchParams.get('q') || undefined,
    categorySlugs: parseArrayParam(searchParams.get('category') || searchParams.get('categories')),
    collectionSlugs: parseArrayParam(searchParams.get('collection') || searchParams.get('collections')),
    brandSlugs: parseArrayParam(searchParams.get('brand') || searchParams.get('brands')),
    genders: rawGenders,
    sizes: parseArrayParam(searchParams.get('size') || searchParams.get('sizes')),
    colors: parseArrayParam(searchParams.get('color') || searchParams.get('colors')),
    minPriceMinor,
    maxPriceMinor,
    sortBy,
    page,
    limit,
  };
}

export function validateSlug(slug: string, entityName: string = 'Resource'): string {
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    throw new BadRequestError(`${entityName} slug is required.`);
  }
  const clean = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
    throw new BadRequestError(`Invalid ${entityName} slug format: "${slug}".`);
  }
  return clean;
}
