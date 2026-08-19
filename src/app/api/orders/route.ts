import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { OrderService } from '@/server/services/order-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders
 * List authenticated customer orders
 */
export async function GET(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const orders = await OrderService.getCustomerOrders(customer.id);

    return jsonResponse(orders, 200, {
      total: orders.length,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
