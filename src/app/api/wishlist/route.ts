import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { WishlistService } from '@/server/services/wishlist-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wishlist
 * Retrieve authenticated customer wishlist
 */
export async function GET(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const wishlist = await WishlistService.getWishlist(customer.id);

    return jsonResponse(wishlist, 200, {
      total: wishlist.totalItems,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/wishlist
 * Clear authenticated customer wishlist
 */
export async function DELETE(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const wishlist = await WishlistService.clearWishlist(customer.id);

    return jsonResponse(wishlist, 200, {
      message: 'Wishlist cleared.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
