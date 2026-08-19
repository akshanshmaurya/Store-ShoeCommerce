import { NextRequest, NextResponse } from 'next/server';
import { AuthService, AUTH_COOKIE_NAME } from '@/features/auth/server/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, token } = await AuthService.login(body);

    const response = NextResponse.json(
      { success: true, user, message: 'Authentication successful.' },
      { status: 200 }
    );

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid email or password.';
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
