import { NextRequest } from 'next/server';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { POST as forgotPasswordRoute } from '@/app/api/auth/forgot-password/route';
import { POST as resetPasswordRoute } from '@/app/api/auth/reset-password/route';
import { POST as verifyEmailRoute } from '@/app/api/auth/verify-email/route';
import { AuthService } from '@/server/services/auth-service';
import { RateLimiter } from '@/server/utils/rate-limiter';

describe('Storefront Password Reset & Email Verification Test Suite', () => {
  const resetEmail = `reset_test_${Date.now()}@veloce.com`;
  let customerId = '';
  let previewToken = '';

  beforeAll(async () => {
    RateLimiter.clearAll();

    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: resetEmail,
        password: 'InitialPassword123!',
        firstName: 'Seneca',
        lastName: 'Philosopher',
      }),
    });
    const res = await registerRoute(req);
    const json = await res.json();
    customerId = json.data.id;
  });

  it('generates password reset token and returns safe generic response', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: resetEmail }),
    });

    const res = await forgotPasswordRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.message).toContain('If an account exists with this email');
    expect(json.meta?.previewToken).toBeDefined();
    previewToken = json.meta.previewToken;
  });

  it('resets password successfully using valid reset token', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: previewToken,
        newPassword: 'BrandNewPassword456!',
      }),
    });

    const res = await resetPasswordRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify login with new password succeeds
    const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: resetEmail,
        password: 'BrandNewPassword456!',
      }),
    });
    const loginRes = await loginRoute(loginReq);
    expect(loginRes.status).toBe(200);
  });

  it('rejects reused or invalid password reset token', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: previewToken, // Already consumed
        newPassword: 'AnotherPassword789!',
      }),
    });

    const res = await resetPasswordRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('verifies customer email token', async () => {
    const emailToken = await AuthService.requestEmailVerification(customerId);

    const req = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token: emailToken }),
    });

    const res = await verifyEmailRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.isEmailVerified).toBe(true);
  });
});
