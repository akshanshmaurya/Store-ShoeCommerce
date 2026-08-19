import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { OrderService } from '@/server/services/order-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    orderNumber: string;
  };
}

/**
 * POST /api/orders/:orderNumber/cancel
 * Cancel order and release reserved inventory
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const customer = await requireAuth(req);

    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body.reason;
    } catch {
      // Body may be empty
    }

    const cancelledOrder = await OrderService.cancelOrder(
      customer.id,
      params.orderNumber,
      reason
    );

    return jsonResponse(cancelledOrder, 200, {
      message: 'Order cancelled successfully. Reserved inventory has been released.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
