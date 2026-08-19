import { NextRequest } from 'next/server';
import { resolveSession, GUEST_COOKIE_NAME } from '@/server/utils/guest-session';
import { CartService } from '@/server/services/cart-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cart
 * Retrieve current active cart for session
 */
export async function GET(req: NextRequest) {
  try {
    const session = await resolveSession(req);
    const cart = await CartService.getCart(session);

    const response = jsonResponse(cart, 200);

    // Ensure guest cookie is set for guest sessions
    if (!session.isAuthenticated) {
      response.cookies.set({
        name: GUEST_COOKIE_NAME,
        value: session.guestId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/cart
 * Clear active cart
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await resolveSession(req);
    const cart = await CartService.clearCart(session);

    return jsonResponse(cart, 200, {
      message: 'Cart cleared successfully.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
