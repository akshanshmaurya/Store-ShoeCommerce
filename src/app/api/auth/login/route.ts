import { NextRequest } from 'next/server';
import { AuthService, AUTH_COOKIE_NAME } from '@/server/services/auth-service';
import { jsonResponse } from '@/server/utils/api-response';
import { handleApiError } from '@/server/utils/api-error';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    const { customer, token } = await AuthService.login({
      ...body,
      ip,
    });

    const response = jsonResponse(customer, 200, {
      message: 'Authenticated successfully.',
    });

    // Set secure HttpOnly session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
