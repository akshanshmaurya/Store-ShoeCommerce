import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { AccountService } from '@/server/services/account-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * POST /api/account/addresses/:id/default
 * Set address as default delivery destination
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const customer = await requireAuth(req);
    const updated = await AccountService.setDefaultAddress(customer.id, params.id);

    return jsonResponse(updated, 200, {
      message: 'Default address updated successfully.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
