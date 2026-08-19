import { NextRequest } from 'next/server';
import { CatalogService } from '@/server/services/catalog-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/collections
 * List all active collections
 */
export async function GET(request: NextRequest) {
  try {
    const collections = await CatalogService.getCollections();
    return jsonResponse(collections, 200, { total: collections.length });
  } catch (err) {
    return handleApiError(err);
  }
}
