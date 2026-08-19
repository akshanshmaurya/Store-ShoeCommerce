import { NextRequest } from 'next/server';
import { CatalogService } from '@/server/services/catalog-service';
import { validateCatalogQuery } from '@/server/utils/validation';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Public Catalog Query Endpoint (Search, Filter, Sort, Paginate)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const validatedQuery = validateCatalogQuery(searchParams);

    const result = await CatalogService.queryCatalog(validatedQuery);

    return jsonResponse(result.items, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.hasNext,
      hasPrevious: result.hasPrevious,
      facets: result.facets,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
