import { getStorefrontDb } from '../db/mongodb';
import { BRANDS } from '@/features/catalog/data/mock-products';
import { Brand } from '@/features/catalog/types';

export class ServerBrandRepository {
  static async findAll(): Promise<Brand[]> {
    const db = await getStorefrontDb();
    if (db) {
      try {
        const raw = await db.collection('brands').find({ status: 'active', isActive: true }).toArray();
        if (raw && raw.length > 0) {
          return raw.map((b) => ({
            id: b._id.toString(),
            name: b.name,
            slug: b.slug,
            logo: b.logo || '',
            description: b.description || '',
          }));
        }
      } catch (err) {
        console.warn('[MongoDB Brand Repository Fallback]:', err);
      }
    }
    return BRANDS;
  }

  static async findBySlug(slug: string): Promise<Brand | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const db = await getStorefrontDb();
    if (db) {
      try {
        const b = await db.collection('brands').findOne({ slug: cleanSlug, status: 'active', isActive: true });
        if (b) {
          return {
            id: b._id.toString(),
            name: b.name,
            slug: b.slug,
            logo: b.logo || '',
            description: b.description || '',
          };
        }
      } catch (err) {
        console.warn('[MongoDB Brand findBySlug Fallback]:', err);
      }
    }
    return BRANDS.find((b) => b.slug.toLowerCase() === cleanSlug) || null;
  }
}
