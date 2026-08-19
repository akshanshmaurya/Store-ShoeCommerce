import { NextRequest } from 'next/server';
import { AuthService } from '@/server/services/auth-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer = await AuthService.verifyEmail(body.token);

    return jsonResponse(customer, 200, {
      message: 'Email successfully verified.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
