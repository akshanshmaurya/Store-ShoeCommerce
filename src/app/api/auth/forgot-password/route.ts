import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/features/auth/server/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await AuthService.requestPasswordReset(body);

    return NextResponse.json(
      { success: true, message: result.message, previewToken: result.previewToken },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Request failed.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
