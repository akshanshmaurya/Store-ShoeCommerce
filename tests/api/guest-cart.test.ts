import { NextRequest } from 'next/server';
import { GET as getCartRoute } from '@/app/api/cart/route';
import { POST as postCartItemRoute } from '@/app/api/cart/items/route';
import { ServerCartRepository } from '@/server/repositories/cart-repository';
import { GUEST_COOKIE_NAME } from '@/server/utils/guest-session';

describe('Storefront Guest Cart Isolation Test Suite', () => {
  const guest1Id = `guest_alpha_${Date.now()}`;
  const guest2Id = `guest_beta_${Date.now()}`;
  const variant1Id = 'var-prod-apex-carbon-col-obs-sz-100';
  const variant2Id = 'var-prod-apex-carbon-col-crm-sz-100';

  beforeAll(() => {
    ServerCartRepository.clearFallbackStore();
  });

  it('maintains distinct isolated carts for Guest 1 and Guest 2', async () => {
    // 1. Guest 1 adds variant 1 (qty 2)
    const req1 = new NextRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: variant1Id, quantity: 2 }),
    });
    req1.cookies.set(GUEST_COOKIE_NAME, guest1Id);
    await postCartItemRoute(req1);

    // 2. Guest 2 adds variant 2 (qty 3)
    const req2 = new NextRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: variant2Id, quantity: 3 }),
    });
    req2.cookies.set(GUEST_COOKIE_NAME, guest2Id);
    await postCartItemRoute(req2);

    // 3. Verify Guest 1 cart only contains variant 1 (qty 2)
    const check1 = new NextRequest('http://localhost:3000/api/cart');
    check1.cookies.set(GUEST_COOKIE_NAME, guest1Id);
    const res1 = await getCartRoute(check1);
    const json1 = await res1.json();

    expect(json1.data.items.length).toBe(1);
    expect(json1.data.items[0].variantId).toBe(variant1Id);
    expect(json1.data.items[0].quantity).toBe(2);

    // 4. Verify Guest 2 cart only contains variant 2 (qty 3)
    const check2 = new NextRequest('http://localhost:3000/api/cart');
    check2.cookies.set(GUEST_COOKIE_NAME, guest2Id);
    const res2 = await getCartRoute(check2);
    const json2 = await res2.json();

    expect(json2.data.items.length).toBe(1);
    expect(json2.data.items[0].variantId).toBe(variant2Id);
    expect(json2.data.items[0].quantity).toBe(3);
  });
});
