import { NextRequest } from 'next/server';
import { resolveSession, GUEST_COOKIE_NAME } from '@/server/utils/guest-session';
import { CartService } from '@/server/services/cart-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cart/items
 * Add variant item to active cart
 */
export async function POST(req: NextRequest) {
  try {
    const session = await resolveSession(req);
    const body = await req.json();

    const cart = await CartService.addItem(session, {
      variantId: body.variantId,
      productId: body.productId,
      quantity: body.quantity !== undefined ? Number(body.quantity) : 1,
    });

    const response = jsonResponse(cart, 201, {
      message: 'Item added to cart.',
    });

    if (!session.isAuthenticated) {
      response.cookies.set({
        name: GUEST_COOKIE_NAME,
        value: session.guestId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
