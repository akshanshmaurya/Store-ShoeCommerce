import { NextRequest } from 'next/server';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { POST as logoutRoute } from '@/app/api/auth/logout/route';
import { GET as meRoute } from '@/app/api/auth/me/route';
import { AUTH_COOKIE_NAME } from '@/server/services/auth-service';
import { RateLimiter } from '@/server/utils/rate-limiter';

describe('Storefront Authentication API Test Suite', () => {
  beforeEach(() => {
    RateLimiter.clearAll();
  });

  const testEmail = `auth_test_${Date.now()}@veloce.com`;
  let sessionCookie = '';

  it('successfully registers a new customer and sets HttpOnly session cookie', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!',
        firstName: 'Elena',
        lastName: 'Rostova',
        phone: '+1 555-0199',
        marketingOptIn: true,
      }),
    });

    const res = await registerRoute(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.email).toBe(testEmail);
    expect(json.data.firstName).toBe('Elena');
    expect(json.data.passwordHash).toBeUndefined(); // Security: never return hash

    const setCookie = res.cookies.get(AUTH_COOKIE_NAME);
    expect(setCookie).toBeDefined();
    expect(setCookie?.value).toBeTruthy();
    sessionCookie = setCookie!.value;
  });

  it('rejects registration with duplicate email', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail, // Duplicate
        password: 'SecurePassword123!',
        firstName: 'Elena',
        lastName: 'Rostova',
      }),
    });

    const res = await registerRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('BAD_REQUEST');
  });

  it('rejects registration with short password (< 8 chars)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'shortpass@veloce.com',
        password: 'short',
        firstName: 'Test',
        lastName: 'User',
      }),
    });

    const res = await registerRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('successfully logs in with valid credentials', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!',
      }),
    });

    const res = await loginRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.email).toBe(testEmail);
    expect(res.cookies.get(AUTH_COOKIE_NAME)).toBeDefined();
  });

  it('returns generic error for invalid password without revealing user existence', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!',
      }),
    });

    const res = await loginRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Invalid email or password');
  });

  it('returns current user profile when authenticated with session cookie', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/me');
    req.cookies.set(AUTH_COOKIE_NAME, sessionCookie);

    const res = await meRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.email).toBe(testEmail);
    expect(json.data.passwordHash).toBeUndefined();
  });

  it('returns 401 UNAUTHORIZED for /api/auth/me when unauthenticated', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/me');

    const res = await meRoute(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it('clears session cookie on logout', async () => {
    const res = await logoutRoute();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    const cookie = res.cookies.get(AUTH_COOKIE_NAME);
    expect(cookie?.value).toBe('');
  });
});
