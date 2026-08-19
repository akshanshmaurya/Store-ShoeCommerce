import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/server/services/auth-service';
import { jsonResponse } from '@/server/utils/api-response';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = jsonResponse({ authenticated: false }, 200, {
    message: 'Signed out successfully.',
  });

  // Clear session cookie
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
