import { getStorefrontDb } from '../db/mongodb';
import { CATEGORIES } from '@/features/catalog/data/mock-products';
import { Category } from '@/features/catalog/types';

export class ServerCategoryRepository {
  static async findAll(): Promise<Category[]> {
    const db = await getStorefrontDb();
    if (db) {
      try {
        const raw = await db.collection('categories').find({ status: 'active', isActive: true }).toArray();
        if (raw && raw.length > 0) {
          return raw.map((c) => ({
            id: c._id.toString(),
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            image: c.image || '',
            parentId: c.parentId ? c.parentId.toString() : undefined,
            status: 'ACTIVE',
          }));
        }
      } catch (err) {
        console.warn('[MongoDB Category Repository Fallback]:', err);
      }
    }
    return CATEGORIES.filter((c) => c.status === 'ACTIVE');
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const db = await getStorefrontDb();
    if (db) {
      try {
        const c = await db.collection('categories').findOne({ slug: cleanSlug, status: 'active', isActive: true });
        if (c) {
          return {
            id: c._id.toString(),
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            image: c.image || '',
            parentId: c.parentId ? c.parentId.toString() : undefined,
            status: 'ACTIVE',
          };
        }
      } catch (err) {
        console.warn('[MongoDB Category findBySlug Fallback]:', err);
      }
    }
    return CATEGORIES.find((c) => c.slug.toLowerCase() === cleanSlug && c.status === 'ACTIVE') || null;
  }
}
