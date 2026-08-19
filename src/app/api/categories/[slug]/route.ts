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
 * GET /api/categories/:slug
 * Fetch single category by slug
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const slug = validateSlug(params.slug, 'Category');
    const category = await CatalogService.getCategoryBySlug(slug);

    return jsonResponse(category, 200);
  } catch (err) {
    return handleApiError(err);
  }
}
