import { NextRequest } from 'next/server';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as postCartItemRoute } from '@/app/api/cart/items/route';
import { POST as mergeCartRoute } from '@/app/api/cart/merge/route';
import { GET as getCartRoute } from '@/app/api/cart/route';
import { AUTH_COOKIE_NAME } from '@/server/services/auth-service';
import { GUEST_COOKIE_NAME } from '@/server/utils/guest-session';
import { ServerCartRepository } from '@/server/repositories/cart-repository';
import { RateLimiter } from '@/server/utils/rate-limiter';

describe('Storefront Cart Merge Test Suite', () => {
  let customerCookie = '';
  const guestId = `merge_guest_${Date.now()}`;
  const variant1 = 'var-prod-apex-carbon-col-obs-sz-100';
  const variant2 = 'var-prod-apex-carbon-col-crm-sz-100';

  beforeAll(async () => {
    RateLimiter.clearAll();
    ServerCartRepository.clearFallbackStore();

    // Register a customer
    const regReq = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `merge_user_${Date.now()}@veloce.com`,
        password: 'SecurePassword123!',
        firstName: 'Marcus',
        lastName: 'Aurelius',
      }),
    });
    const regRes = await registerRoute(regReq);
    customerCookie = regRes.cookies.get(AUTH_COOKIE_NAME)!.value;
  });

  it('merges guest cart items into customer cart, summing overlapping quantities up to limit', async () => {
    // 1. Customer already has variant 1 (qty 4) in their authenticated cart
    const custReq = new NextRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: variant1, quantity: 4 }),
    });
    custReq.cookies.set(AUTH_COOKIE_NAME, customerCookie);
    await postCartItemRoute(custReq);

    // 2. Guest adds variant 1 (qty 3) and variant 2 (qty 2) to guest cart
    const guestReq1 = new NextRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: variant1, quantity: 3 }),
    });
    guestReq1.cookies.set(GUEST_COOKIE_NAME, guestId);
    await postCartItemRoute(guestReq1);

    const guestReq2 = new NextRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: variant2, quantity: 2 }),
    });
    guestReq2.cookies.set(GUEST_COOKIE_NAME, guestId);
    await postCartItemRoute(guestReq2);

    // 3. Perform merge upon login
    const mergeReq = new NextRequest('http://localhost:3000/api/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ guestId }),
    });
    mergeReq.cookies.set(AUTH_COOKIE_NAME, customerCookie);
    mergeReq.cookies.set(GUEST_COOKIE_NAME, guestId);

    const mergeRes = await mergeCartRoute(mergeReq);
    const mergeJson = await mergeRes.json();

    expect(mergeRes.status).toBe(200);
    expect(mergeJson.success).toBe(true);
    expect(mergeJson.data.items.length).toBe(2);

    // Overlapping variant 1: 4 (customer) + 3 (guest) = 7
    const mergedV1 = mergeJson.data.items.find((i: any) => i.variantId === variant1);
    expect(mergedV1.quantity).toBe(7);

    // Non-overlapping variant 2: 2 (guest) = 2
    const mergedV2 = mergeJson.data.items.find((i: any) => i.variantId === variant2);
    expect(mergedV2.quantity).toBe(2);

    // 4. Retry merge is idempotent (guest cart is already converted, customer cart unchanged)
    const retryReq = new NextRequest('http://localhost:3000/api/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ guestId }),
    });
    retryReq.cookies.set(AUTH_COOKIE_NAME, customerCookie);
    retryReq.cookies.set(GUEST_COOKIE_NAME, guestId);

    const retryRes = await mergeCartRoute(retryReq);
    const retryJson = await retryRes.json();

    expect(retryJson.data.items.find((i: any) => i.variantId === variant1).quantity).toBe(7);
  });
});
