import { NextRequest, NextResponse } from 'next/server';
import { AuthService, AUTH_COOKIE_NAME } from '@/features/auth/server/auth-service';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, user: null, message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  const user = await AuthService.getCurrentUser(token);
  if (!user) {
    // Invalidate cookie if token is invalid or expired
    const res = NextResponse.json(
      { success: false, user: null, message: 'Session expired' },
      { status: 401 }
    );
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ success: true, user }, { status: 200 });
}
