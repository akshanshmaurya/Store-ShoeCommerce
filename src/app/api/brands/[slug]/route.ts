import { NextRequest } from 'next/server';
import { CatalogService } from '@/server/services/catalog-service';
import { validateSlug } from '@/server/utils/validation';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    slug: string;
  };
}

/**
 * GET /api/brands/:slug
 * Fetch single brand by slug
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const slug = validateSlug(params.slug, 'Brand');
    const brand = await CatalogService.getBrandBySlug(slug);

    return jsonResponse(brand, 200);
  } catch (err) {
    return handleApiError(err);
  }
}
