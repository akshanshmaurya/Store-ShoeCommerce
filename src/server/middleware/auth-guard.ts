import { NextRequest } from 'next/server';
import { AuthService, AUTH_COOKIE_NAME, SanitizedCustomer } from '../services/auth-service';
import { ApiError } from '../utils/api-error';

/**
 * Server-Side Auth Guard Helper for API Route Handlers
 * Extracts session from cookie or Authorization header, validates token, and returns authenticated customer.
 */
export async function requireAuth(req: NextRequest): Promise<SanitizedCustomer> {
  // 1. Check HttpOnly cookie
  let token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 2. Check Authorization Bearer header fallback
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    throw new ApiError('Authentication required. Please sign in to continue.', 401, 'UNAUTHORIZED');
  }

  const customer = await AuthService.getCurrentUser(token);
  if (!customer) {
    throw new ApiError('Session has expired or is invalid. Please sign in again.', 401, 'UNAUTHORIZED');
  }

  if (customer.status !== 'active') {
    throw new ApiError('This account is currently suspended. Please contact concierge support.', 403, 'ACCOUNT_SUSPENDED');
  }

  return customer;
}
