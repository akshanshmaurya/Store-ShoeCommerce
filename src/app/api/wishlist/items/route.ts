import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { WishlistService } from '@/server/services/wishlist-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * POST /api/wishlist/items
 * Add product to authenticated customer wishlist
 */
export async function POST(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const body = await req.json();

    const wishlist = await WishlistService.addItem(
      customer.id,
      body.productId,
      body.variantId
    );

    return jsonResponse(wishlist, 201, {
      message: 'Item added to wishlist.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
