import { ServerProductRepository, ProductQueryResult } from '../repositories/product-repository';
import { ServerCategoryRepository } from '../repositories/category-repository';
import { ServerCollectionRepository } from '../repositories/collection-repository';
import { ServerBrandRepository } from '../repositories/brand-repository';
import { ValidatedCatalogQuery } from '../utils/validation';
import { NotFoundError } from '../utils/api-error';
import { Product, Category, Collection, Brand, SearchSuggestionResult } from '@/features/catalog/types';

export class CatalogService {
  /**
   * Query catalog products with filters, search, sorting, and pagination
   */
  static async queryCatalog(query: ValidatedCatalogQuery): Promise<ProductQueryResult> {
    return ServerProductRepository.queryProducts(query);
  }

  /**
   * Get single product by slug
   */
  static async getProductBySlug(slug: string): Promise<Product> {
    const product = await ServerProductRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundError(`Product with slug "${slug}" not found.`);
    }
    return product;
  }

  /**
   * Get all active categories
   */
  static async getCategories(): Promise<Category[]> {
    return ServerCategoryRepository.findAll();
  }

  /**
   * Get single category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<Category> {
    const cat = await ServerCategoryRepository.findBySlug(slug);
    if (!cat) {
      throw new NotFoundError(`Category with slug "${slug}" not found.`);
    }
    return cat;
  }

  /**
   * Get all active collections
   */
  static async getCollections(): Promise<Collection[]> {
    return ServerCollectionRepository.findAll();
  }

  /**
   * Get single collection by slug
   */
  static async getCollectionBySlug(slug: string): Promise<Collection> {
    const col = await ServerCollectionRepository.findBySlug(slug);
    if (!col) {
      throw new NotFoundError(`Collection with slug "${slug}" not found.`);
    }
    return col;
  }

  /**
   * Get all active brands
   */
  static async getBrands(): Promise<Brand[]> {
    return ServerBrandRepository.findAll();
  }

  /**
   * Get single brand by slug
   */
  static async getBrandBySlug(slug: string): Promise<Brand> {
    const brand = await ServerBrandRepository.findBySlug(slug);
    if (!brand) {
      throw new NotFoundError(`Brand with slug "${slug}" not found.`);
    }
    return brand;
  }

  /**
   * Get instant search suggestions
   */
  static async getSuggestions(keyword: string, limit: number = 4): Promise<SearchSuggestionResult> {
    return ServerProductRepository.getSuggestions(keyword, limit);
  }

  /**
   * Get featured products for homepage
   */
  static async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    const result = await ServerProductRepository.queryProducts({
      sortBy: 'featured',
      page: 1,
      limit,
    });
    return result.items;
  }
}
