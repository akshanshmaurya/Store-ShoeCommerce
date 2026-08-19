import { NextRequest } from 'next/server';
import { resolveSession } from '@/server/utils/guest-session';
import { CartService } from '@/server/services/cart-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    variantId: string;
  };
}

/**
 * PATCH /api/cart/items/:variantId
 * Update item quantity in active cart
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await resolveSession(req);
    const body = await req.json();

    const cart = await CartService.updateQuantity(
      session,
      params.variantId,
      Number(body.quantity)
    );

    return jsonResponse(cart, 200, {
      message: 'Cart updated.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/cart/items/:variantId
 * Remove item from active cart
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await resolveSession(req);
    const cart = await CartService.removeItem(session, params.variantId);

    return jsonResponse(cart, 200, {
      message: 'Item removed from cart.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
