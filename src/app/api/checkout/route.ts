import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { CheckoutService } from '@/server/services/checkout-service';
import { RateLimiter } from '@/server/utils/rate-limiter';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError, ApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * POST /api/checkout
 * Authenticated checkout submission
 */
export async function POST(req: NextRequest) {
  try {
    const customer = await requireAuth(req);

    // Rate limit checkout attempts (Max 10 checkout attempts per minute per customer)
    const rateCheck = RateLimiter.isAllowed(`checkout:${customer.id}`, {
      windowMs: 60 * 1000,
      maxRequests: 10,
    });
    if (!rateCheck.allowed) {
      throw new ApiError(
        `Too many checkout attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        429,
        'RATE_LIMITED'
      );
    }

    const body = await req.json();
    const order = await CheckoutService.processCheckout(customer.id, {
      shippingAddressId: body.shippingAddressId,
      billingAddressId: body.billingAddressId,
      idempotencyKey: body.idempotencyKey,
      notes: body.notes,
    });

    return jsonResponse(order, 201, {
      message: 'Order placed successfully. Inventory has been reserved.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
