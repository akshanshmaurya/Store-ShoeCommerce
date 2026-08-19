import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/features/auth/server/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await AuthService.resetPassword(body);

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset failed.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
