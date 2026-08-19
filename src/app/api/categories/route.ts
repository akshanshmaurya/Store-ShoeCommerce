import { NextRequest } from 'next/server';
import { CatalogService } from '@/server/services/catalog-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/categories
 * List all active categories
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await CatalogService.getCategories();
    return jsonResponse(categories, 200, { total: categories.length });
  } catch (err) {
    return handleApiError(err);
  }
}
