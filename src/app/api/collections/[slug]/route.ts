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
 * GET /api/collections/:slug
 * Fetch single collection by slug
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const slug = validateSlug(params.slug, 'Collection');
    const collection = await CatalogService.getCollectionBySlug(slug);

    return jsonResponse(collection, 200);
  } catch (err) {
    return handleApiError(err);
  }
}
