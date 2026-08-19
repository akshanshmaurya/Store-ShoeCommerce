import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { resolveSession, GUEST_COOKIE_NAME } from '@/server/utils/guest-session';
import { CartService } from '@/server/services/cart-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cart/merge
 * Merge guest cart into authenticated customer cart upon login/registration
 */
export async function POST(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const session = await resolveSession(req);

    // Read guestId from request body or cookie
    let guestIdToMerge = session.guestId;
    try {
      const body = await req.json();
      if (body.guestId && typeof body.guestId === 'string') {
        guestIdToMerge = body.guestId;
      }
    } catch {
      // Body may be empty
    }

    const mergedCart = await CartService.mergeCarts(customer.id, guestIdToMerge);
    const response = jsonResponse(mergedCart, 200, {
      message: 'Cart merged successfully.',
    });

    // Clear guestId cookie upon merge
    response.cookies.set({
      name: GUEST_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
