import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { WishlistService } from '@/server/services/wishlist-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    productId: string;
  };
}

/**
 * DELETE /api/wishlist/items/:productId
 * Remove product from authenticated customer wishlist
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const customer = await requireAuth(req);
    const wishlist = await WishlistService.removeItem(customer.id, params.productId);

    return jsonResponse(wishlist, 200, {
      message: 'Item removed from wishlist.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
