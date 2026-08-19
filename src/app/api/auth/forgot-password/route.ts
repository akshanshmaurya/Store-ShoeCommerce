import { NextRequest } from 'next/server';
import { AuthService } from '@/server/services/auth-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    const result = await AuthService.requestPasswordReset(body.email, ip);

    return jsonResponse(
      { success: true, message: result.message },
      200,
      result.previewToken ? { previewToken: result.previewToken } : undefined
    );
  } catch (err) {
    return handleApiError(err);
  }
}
