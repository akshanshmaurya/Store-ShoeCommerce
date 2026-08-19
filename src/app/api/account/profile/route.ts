import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { AccountService } from '@/server/services/account-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/profile
 * Get authenticated customer profile
 */
export async function GET(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const profile = await AccountService.getProfile(customer.id);
    return jsonResponse(profile, 200);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PATCH /api/account/profile
 * Update personal profile and sizing preferences
 */
export async function PATCH(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    const body = await req.json();

    const updated = await AccountService.updateProfile(customer.id, {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      preferredSizeSystem: body.preferredSizeSystem,
      preferredSizeValue: body.preferredSizeValue,
      marketingOptIn: body.marketingOptIn,
    });

    return jsonResponse(updated, 200, {
      message: 'Profile updated successfully.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
