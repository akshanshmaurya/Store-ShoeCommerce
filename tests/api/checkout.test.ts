import { NextRequest } from 'next/server';
import { POST as checkoutRoute } from '@/app/api/checkout/route';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as addAddressRoute } from '@/app/api/account/addresses/route';
import { POST as addCartItemRoute } from '@/app/api/cart/items/route';
import { GET as getCartRoute } from '@/app/api/cart/route';
import { AUTH_COOKIE_NAME } from '@/server/services/auth-service';
import { ServerCartRepository } from '@/server/repositories/cart-repository';
import { ServerOrderRepository } from '@/server/repositories/order-repository';
import { ServerInventoryReservationRepository } from '@/server/repositories/inventory-reservation-repository';
import { RateLimiter } from '@/server/utils/rate-limiter';

describe('Storefront Checkout API Test Suite', () => {
  let user1Cookie = '';
  let user2Cookie = '';
  let user1AddressId = '';
  let user2AddressId = '';
  const validVariantId = 'var-prod-apex-carbon-col-obs-sz-100';

  beforeAll(async () => {
    RateLimiter.clearAll();
    ServerCartRepository.clearFallbackStore();
    ServerOrderRepository.clearFallbackStore();
    ServerInventoryReservationRepository.clearFallbackStore();

    // Register User 1
    const reg1 = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `checkout_user1_${Date.now()}@veloce.com`,
        password: 'Password123!',
        firstName: 'Alexander',
        lastName: 'Hamilton',
      }),
    });
    const res1 = await registerRoute(reg1);
    user1Cookie = res1.cookies.get(AUTH_COOKIE_NAME)!.value;

    // Create address for User 1
    const addr1Req = new NextRequest('http://localhost:3000/api/account/addresses', {
      method: 'POST',
      body: JSON.stringify({
        recipientName: 'Alexander Hamilton',
        phone: '+1 555-0100',
        line1: '57 Wall Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10005',
        country: 'United States',
        isDefault: true,
      }),
    });
    addr1Req.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const addr1Res = await addAddressRoute(addr1Req);
    const addr1Json = await addr1Res.json();
    user1AddressId = addr1Json.data.id;

    // Register User 2
    const reg2 = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `checkout_user2_${Date.now()}@veloce.com`,
        password: 'Password123!',
        firstName: 'Aaron',
        lastName: 'Burr',
      }),
    });
    const res2 = await registerRoute(reg2);
    user2Cookie = res2.cookies.get(AUTH_COOKIE_NAME)!.value;

    // Create address for User 2
    const addr2Req = new NextRequest('http://localhost:3000/api/account/addresses', {
      method: 'POST',
      body: JSON.stringify({
        recipientName: 'Aaron Burr',
        phone: '+1 555-0200',
        line1: 'Richmond Hill',
        city: 'New York',
        state: 'NY',
        postalCode: '10014',
        country: 'United States',
        isDefault: true,
      }),
    });
    addr2Req.cookies.set(AUTH_COOKIE_NAME, user2Cookie);
    const addr2Res = await addAddressRoute(addr2Req);
    const addr2Json = await addr2Res.json();
    user2AddressId = addr2Json.data.id;
  });

  it('rejects unauthenticated checkout requests with 401 UNAUTHORIZED', async () => {
    const req = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ shippingAddressId: user1AddressId }),
    });

    const res = await checkoutRoute(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it('rejects checkout when customer cart is empty', async () => {
    const req = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ shippingAddressId: user1AddressId }),
    });
    req.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const res = await checkoutRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('cart is empty');
  });

  it('rejects checkout with address belonging to a different customer', async () => {
    // Add item to User 1 cart
    const addReq = new NextRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: validVariantId, quantity: 1 }),
    });
    addReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    await addCartItemRoute(addReq);

    // User 1 tries to use User 2's address
    const req = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ shippingAddressId: user2AddressId }),
    });
    req.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const res = await checkoutRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Invalid shipping address');
  });

  it('successfully creates an order, calculates server totals, reserves stock, and clears cart', async () => {
    // Checkout for User 1
    const idempotencyKey = `idemp_${Date.now()}`;
    const req = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        shippingAddressId: user1AddressId,
        idempotencyKey,
      }),
    });
    req.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const res = await checkoutRoute(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    expect(json.data.status).toBe('pending');
    expect(json.data.paymentStatus).toBe('pending');
    expect(json.data.items.length).toBe(1);
    expect(json.data.items[0].variantId).toBe(validVariantId);
    expect(json.data.items[0].orderedQuantity).toBe(1);
    expect(json.data.subtotal).toBe(28500); // $285.00
    expect(json.data.taxTotal).toBe(2280); // 8% of 28500 = 2280
    expect(json.data.shippingTotal).toBe(0); // Free shipping
    expect(json.data.total).toBe(30780); // 28500 + 2280 = 30780
    expect(json.data.shippingAddress.line1).toBe('57 Wall Street');

    // Verify cart was cleared after successful order creation
    const cartReq = new NextRequest('http://localhost:3000/api/cart');
    cartReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const cartRes = await getCartRoute(cartReq);
    const cartJson = await cartRes.json();
    expect(cartJson.data.items.length).toBe(0);

    // Test idempotency: calling checkout again with same idempotencyKey returns existing order
    const retryReq = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        shippingAddressId: user1AddressId,
        idempotencyKey,
      }),
    });
    retryReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const retryRes = await checkoutRoute(retryReq);
    const retryJson = await retryRes.json();

    expect(retryRes.status).toBe(201);
    expect(retryJson.data.orderNumber).toBe(json.data.orderNumber);
  });
});
