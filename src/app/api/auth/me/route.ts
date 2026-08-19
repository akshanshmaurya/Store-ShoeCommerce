import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth-guard';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const customer = await requireAuth(req);
    return jsonResponse(customer, 200);
  } catch (err) {
    return handleApiError(err);
  }
}
