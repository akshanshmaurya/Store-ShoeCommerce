import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { AccountService } from '@/server/services/account-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/addresses
 * List saved addresses for authenticated customer
 */
export async function GET(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const addresses = await AccountService.getAddresses(customer.id);
    return jsonResponse(addresses, 200, { total: addresses.length });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/account/addresses
 * Create a new address for authenticated customer
 */
export async function POST(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const body = await req.json();

    const address = await AccountService.createAddress(customer.id, {
      recipientName: body.recipientName,
      phone: body.phone,
      line1: body.line1,
      line2: body.line2,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      isDefault: body.isDefault,
      type: body.type,
    });

    return jsonResponse(address, 201, {
      message: 'Address saved successfully.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
