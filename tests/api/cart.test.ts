import { NextRequest } from 'next/server';
import { GET as getCartRoute, DELETE as deleteCartRoute } from '@/app/api/cart/route';
import { POST as postCartItemRoute } from '@/app/api/cart/items/route';
import { PATCH as patchCartItemRoute, DELETE as deleteCartItemRoute } from '@/app/api/cart/items/[variantId]/route';
import { ServerCartRepository } from '@/server/repositories/cart-repository';
import { GUEST_COOKIE_NAME } from '@/server/utils/guest-session';

describe('Storefront Cart API Test Suite', () => {
  const guestId = `test_guest_${Date.now()}`;
  const validVariantId = 'var-prod-apex-carbon-col-obs-sz-100';
  const validProductId = 'prod-apex-carbon';

  beforeEach(() => {
    ServerCartRepository.clearFallbackStore();
  });

  function createGuestRequest(url: string, init?: any): NextRequest {
    const req = new NextRequest(url, init);
    req.cookies.set(GUEST_COOKIE_NAME, guestId);
    return req;
  }

  it('retrieves an empty active cart for a new session', async () => {
    const req = createGuestRequest('http://localhost:3000/api/cart');
    const res = await getCartRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.items).toEqual([]);
    expect(json.data.totalItems).toBe(0);
    expect(json.data.subtotalMinor).toBe(0);
  });

  it('adds a valid item to the cart', async () => {
    const req = createGuestRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        variantId: validVariantId,
        productId: validProductId,
        quantity: 2,
      }),
    });

    const res = await postCartItemRoute(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.items.length).toBe(1);
    expect(json.data.items[0].variantId).toBe(validVariantId);
    expect(json.data.items[0].quantity).toBe(2);
    expect(json.data.items[0].costPrice).toBeUndefined(); // Security invariant: no costPrice
    expect(json.data.totalItems).toBe(2);
    expect(json.data.subtotalMinor).toBeGreaterThan(0);
  });

  it('increments quantity when adding the same variant twice without creating duplicates', async () => {
    // First add: qty 1
    const req1 = createGuestRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: validVariantId, quantity: 1 }),
    });
    await postCartItemRoute(req1);

    // Second add: qty 2
    const req2 = createGuestRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: validVariantId, quantity: 2 }),
    });
    const res2 = await postCartItemRoute(req2);
    const json2 = await res2.json();

    expect(res2.status).toBe(201);
    expect(json2.data.items.length).toBe(1); // No duplicates
    expect(json2.data.items[0].quantity).toBe(3); // 1 + 2 = 3
  });

  it('updates line item quantity within allowed bounds (1 to 10)', async () => {
    // Add item
    const addReq = createGuestRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: validVariantId, quantity: 1 }),
    });
    await postCartItemRoute(addReq);

    // Update quantity to 5
    const patchReq = createGuestRequest(`http://localhost:3000/api/cart/items/${validVariantId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: 5 }),
    });
    const patchRes = await patchCartItemRoute(patchReq, { params: { variantId: validVariantId } });
    const patchJson = await patchRes.json();

    expect(patchRes.status).toBe(200);
    expect(patchJson.data.items[0].quantity).toBe(5);
    expect(patchJson.data.totalItems).toBe(5);
  });

  it('rejects invalid quantity (0, negative, > 10, non-integer)', async () => {
    const testCases = [0, -1, 15, 2.5];

    for (const invalidQty of testCases) {
      const req = createGuestRequest('http://localhost:3000/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variantId: validVariantId, quantity: invalidQty }),
      });
      const res = await postCartItemRoute(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    }
  });

  it('rejects adding a non-existent variant', async () => {
    const req = createGuestRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: 'v-non-existent-999', quantity: 1 }),
    });
    const res = await postCartItemRoute(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
  });

  it('removes an item from cart', async () => {
    // Add item
    const addReq = createGuestRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: validVariantId, quantity: 1 }),
    });
    await postCartItemRoute(addReq);

    // Remove item
    const delReq = createGuestRequest(`http://localhost:3000/api/cart/items/${validVariantId}`, {
      method: 'DELETE',
    });
    const delRes = await deleteCartItemRoute(delReq, { params: { variantId: validVariantId } });
    const delJson = await delRes.json();

    expect(delRes.status).toBe(200);
    expect(delJson.data.items.length).toBe(0);
    expect(delJson.data.totalItems).toBe(0);
  });

  it('clears all items in cart', async () => {
    // Add item
    const addReq = createGuestRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: validVariantId, quantity: 2 }),
    });
    await postCartItemRoute(addReq);

    // Clear cart
    const clearReq = createGuestRequest('http://localhost:3000/api/cart', { method: 'DELETE' });
    const clearRes = await deleteCartRoute(clearReq);
    const clearJson = await clearRes.json();

    expect(clearRes.status).toBe(200);
    expect(clearJson.data.items.length).toBe(0);
  });
});
