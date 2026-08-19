import { NextRequest } from 'next/server';
import { GET as getWishlistRoute, DELETE as deleteWishlistRoute } from '@/app/api/wishlist/route';
import { POST as postWishlistItemRoute } from '@/app/api/wishlist/items/route';
import { DELETE as deleteWishlistItemRoute } from '@/app/api/wishlist/items/[productId]/route';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { AUTH_COOKIE_NAME } from '@/server/services/auth-service';
import { ServerWishlistRepository } from '@/server/repositories/wishlist-repository';
import { RateLimiter } from '@/server/utils/rate-limiter';

describe('Storefront Wishlist API Test Suite', () => {
  let user1Cookie = '';
  let user2Cookie = '';
  const prod1 = 'prod-apex-carbon';
  const prod2 = 'prod-aurora-monolith';

  beforeAll(async () => {
    RateLimiter.clearAll();
    ServerWishlistRepository.clearFallbackStore();

    // Register User 1
    const reg1 = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `wish_user1_${Date.now()}@veloce.com`,
        password: 'Password123!',
        firstName: 'Elena',
        lastName: 'Rostova',
      }),
    });
    const res1 = await registerRoute(reg1);
    user1Cookie = res1.cookies.get(AUTH_COOKIE_NAME)!.value;

    // Register User 2
    const reg2 = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `wish_user2_${Date.now()}@veloce.com`,
        password: 'Password123!',
        firstName: 'Dmitri',
        lastName: 'Volkov',
      }),
    });
    const res2 = await registerRoute(reg2);
    user2Cookie = res2.cookies.get(AUTH_COOKIE_NAME)!.value;
  });

  it('rejects unauthenticated requests with 401 UNAUTHORIZED', async () => {
    const req = new NextRequest('http://localhost:3000/api/wishlist');
    const res = await getWishlistRoute(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it('adds products to authenticated customer wishlist with duplicate prevention', async () => {
    // 1. Add prod1
    const req1 = new NextRequest('http://localhost:3000/api/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId: prod1 }),
    });
    req1.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const res1 = await postWishlistItemRoute(req1);
    const json1 = await res1.json();

    expect(res1.status).toBe(201);
    expect(json1.data.items.length).toBe(1);
    expect(json1.data.items[0].productId).toBe(prod1);

    // 2. Attempt duplicate add of prod1
    const dupReq = new NextRequest('http://localhost:3000/api/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId: prod1 }),
    });
    dupReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const dupRes = await postWishlistItemRoute(dupReq);
    const dupJson = await dupRes.json();

    expect(dupJson.data.items.length).toBe(1); // No duplicates

    // 3. Add prod2
    const req2 = new NextRequest('http://localhost:3000/api/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId: prod2 }),
    });
    req2.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const res2 = await postWishlistItemRoute(req2);
    const json2 = await res2.json();

    expect(json2.data.items.length).toBe(2);
  });

  it('enforces customer isolation (User 2 has separate empty wishlist)', async () => {
    const req = new NextRequest('http://localhost:3000/api/wishlist');
    req.cookies.set(AUTH_COOKIE_NAME, user2Cookie);

    const res = await getWishlistRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.items.length).toBe(0);
  });

  it('removes product from wishlist and clears wishlist', async () => {
    // 1. Remove prod1
    const delReq = new NextRequest(`http://localhost:3000/api/wishlist/items/${prod1}`, {
      method: 'DELETE',
    });
    delReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const delRes = await deleteWishlistItemRoute(delReq, { params: { productId: prod1 } });
    const delJson = await delRes.json();

    expect(delRes.status).toBe(200);
    expect(delJson.data.items.length).toBe(1);
    expect(delJson.data.items[0].productId).toBe(prod2);

    // 2. Clear wishlist
    const clearReq = new NextRequest('http://localhost:3000/api/wishlist', { method: 'DELETE' });
    clearReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const clearRes = await deleteWishlistRoute(clearReq);
    const clearJson = await clearRes.json();

    expect(clearRes.status).toBe(200);
    expect(clearJson.data.items.length).toBe(0);
  });
});
