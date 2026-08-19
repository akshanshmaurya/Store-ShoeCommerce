import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, AuthService } from '../services/auth-service';

export const GUEST_COOKIE_NAME = 'veloce_guest_id';

export interface ResolvedSession {
  customerId?: string;
  guestId: string;
  isAuthenticated: boolean;
}

/**
 * Resolve session identity from request
 * Prioritizes authenticated customer session via `veloce_session`,
 * and falls back to / provides `veloce_guest_id` for guest interactions.
 */
export async function resolveSession(req: NextRequest): Promise<ResolvedSession> {
  // 1. Check authenticated session
  const authCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  let customerId: string | undefined;

  if (authCookie) {
    const customer = await AuthService.getCurrentUser(authCookie);
    if (customer && customer.status === 'active') {
      customerId = customer.id;
    }
  }

  // 2. Check or generate guestId
  let guestId = req.cookies.get(GUEST_COOKIE_NAME)?.value;
  if (!guestId) {
    const guestHeader = req.headers.get('x-guest-id');
    if (guestHeader && guestHeader.trim()) {
      guestId = guestHeader.trim();
    } else {
      guestId = `guest_${crypto.randomBytes(16).toString('hex')}`;
    }
  }

  return {
    customerId,
    guestId,
    isAuthenticated: !!customerId,
  };
}
