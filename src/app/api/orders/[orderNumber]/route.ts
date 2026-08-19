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
 * GET /api/orders/:orderNumber
 * Get single order detail strictly scoped to authenticated customer
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const customer = await requireAuth(req);
    const order = await OrderService.getOrderDetails(customer.id, params.orderNumber);

    return jsonResponse(order, 200);
  } catch (err) {
    return handleApiError(err);
  }
}
