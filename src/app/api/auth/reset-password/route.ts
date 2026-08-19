import { NextRequest } from 'next/server';
import { AuthService } from '@/server/services/auth-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await AuthService.resetPassword(body.token, body.newPassword || body.password);

    return jsonResponse(result, 200);
  } catch (err) {
    return handleApiError(err);
  }
}
