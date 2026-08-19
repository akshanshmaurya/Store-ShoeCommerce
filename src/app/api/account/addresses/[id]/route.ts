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
 * PATCH /api/account/addresses/:id
 * Update an existing customer address
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const customer = await requireAuth(req);
    const body = await req.json();

    const updated = await AccountService.updateAddress(customer.id, params.id, body);
    return jsonResponse(updated, 200, { message: 'Address updated successfully.' });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/account/addresses/:id
 * Delete a customer address
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const customer = await requireAuth(req);
    await AccountService.deleteAddress(customer.id, params.id);
    return jsonResponse({ deleted: true, id: params.id }, 200, {
      message: 'Address deleted successfully.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
