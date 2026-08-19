import { getStorefrontDb } from '../db/mongodb';
import { COLLECTIONS } from '@/features/catalog/data/mock-products';
import { Collection } from '@/features/catalog/types';

export class ServerCollectionRepository {
  static async findAll(): Promise<Collection[]> {
    const db = await getStorefrontDb();
    if (db) {
      try {
        const raw = await db.collection('collections').find({ status: 'active', isActive: true }).toArray();
        if (raw && raw.length > 0) {
          return raw.map((c) => ({
            id: c._id.toString(),
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            bannerImage: c.image || c.bannerImage || '',
          }));
        }
      } catch (err) {
        console.warn('[MongoDB Collection Repository Fallback]:', err);
      }
    }
    return COLLECTIONS;
  }

  static async findBySlug(slug: string): Promise<Collection | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const db = await getStorefrontDb();
    if (db) {
      try {
        const c = await db.collection('collections').findOne({ slug: cleanSlug, status: 'active', isActive: true });
        if (c) {
          return {
            id: c._id.toString(),
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            bannerImage: c.image || c.bannerImage || '',
          };
        }
      } catch (err) {
        console.warn('[MongoDB Collection findBySlug Fallback]:', err);
      }
    }
    return COLLECTIONS.find((c) => c.slug.toLowerCase() === cleanSlug) || null;
  }
}
