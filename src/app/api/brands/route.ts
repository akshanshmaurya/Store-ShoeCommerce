import { NextRequest } from 'next/server';
import { CatalogService } from '@/server/services/catalog-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/brands
 * List all active brands
 */
export async function GET(request: NextRequest) {
  try {
    const brands = await CatalogService.getBrands();
    return jsonResponse(brands, 200, { total: brands.length });
  } catch (err) {
    return handleApiError(err);
  }
}
