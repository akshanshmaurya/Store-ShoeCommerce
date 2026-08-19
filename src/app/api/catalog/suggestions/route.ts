import { NextRequest } from 'next/server';
import { CatalogService } from '@/server/services/catalog-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/catalog/suggestions?q=...&limit=...
 * Autocomplete search suggestions for instant modal & quick search
 */
export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q') || req.nextUrl.searchParams.get('query') || '';
    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || 5), 20) : 5;

    const suggestions = await CatalogService.getSuggestions(query, limit);

    return jsonResponse(suggestions, 200, { query, limit });
  } catch (err) {
    return handleApiError(err);
  }
}
