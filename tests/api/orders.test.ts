import { NextRequest } from 'next/server';
import { GET as getOrdersRoute } from '@/app/api/orders/route';
import { GET as getOrderDetailRoute } from '@/app/api/orders/[orderNumber]/route';
import { POST as cancelOrderRoute } from '@/app/api/orders/[orderNumber]/cancel/route';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as addAddressRoute } from '@/app/api/account/addresses/route';
import { POST as addCartItemRoute } from '@/app/api/cart/items/route';
import { POST as checkoutRoute } from '@/app/api/checkout/route';
import { AUTH_COOKIE_NAME } from '@/server/services/auth-service';
import { ServerCartRepository } from '@/server/repositories/cart-repository';
import { ServerOrderRepository } from '@/server/repositories/order-repository';
import { ServerInventoryReservationRepository } from '@/server/repositories/inventory-reservation-repository';
import { RateLimiter } from '@/server/utils/rate-limiter';

describe('Storefront Orders & Cancellation API Test Suite', () => {
  let user1Cookie = '';
  let user2Cookie = '';
  let user1OrderNumber = '';
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
        email: `order_user1_${Date.now()}@veloce.com`,
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Adams',
      }),
    });
    const res1 = await registerRoute(reg1);
    user1Cookie = res1.cookies.get(AUTH_COOKIE_NAME)!.value;

    // Create address for User 1
    const addr1Req = new NextRequest('http://localhost:3000/api/account/addresses', {
      method: 'POST',
      body: JSON.stringify({
        recipientName: 'John Adams',
        phone: '+1 555-0101',
        line1: '141 Franklin Street',
        city: 'Quincy',
        state: 'MA',
        postalCode: '02169',
        country: 'United States',
        isDefault: true,
      }),
    });
    addr1Req.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const addr1Res = await addAddressRoute(addr1Req);
    const addr1Json = await addr1Res.json();
    const user1AddressId = addr1Json.data.id;

    // Add item to User 1 cart and checkout
    const addCartReq = new NextRequest('http://localhost:3000/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: validVariantId, quantity: 1 }),
    });
    addCartReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    await addCartItemRoute(addCartReq);

    const chkReq = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ shippingAddressId: user1AddressId }),
    });
    chkReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const chkRes = await checkoutRoute(chkReq);
    const chkJson = await chkRes.json();
    user1OrderNumber = chkJson.data.orderNumber;

    // Register User 2
    const reg2 = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `order_user2_${Date.now()}@veloce.com`,
        password: 'Password123!',
        firstName: 'Thomas',
        lastName: 'Jefferson',
      }),
    });
    const res2 = await registerRoute(reg2);
    user2Cookie = res2.cookies.get(AUTH_COOKIE_NAME)!.value;
  });

  it('lists orders for authenticated customer', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders');
    req.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const res = await getOrdersRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(1);
    expect(json.data[0].orderNumber).toBe(user1OrderNumber);
    expect(json.data[0].costPrice).toBeUndefined(); // Security invariant
  });

  it('retrieves detailed order information by orderNumber for the owner', async () => {
    const req = new NextRequest(`http://localhost:3000/api/orders/${user1OrderNumber}`);
    req.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const res = await getOrderDetailRoute(req, { params: { orderNumber: user1OrderNumber } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.orderNumber).toBe(user1OrderNumber);
    expect(json.data.items[0].productName).toBe('Veloce Apex Carbon 01');
    expect(json.data.items[0].costPrice).toBeUndefined();
    expect(json.data.warehouseId).toBeUndefined();
  });

  it('enforces customer isolation (User 2 cannot access User 1 order by orderNumber)', async () => {
    const req = new NextRequest(`http://localhost:3000/api/orders/${user1OrderNumber}`);
    req.cookies.set(AUTH_COOKIE_NAME, user2Cookie); // User 2 session

    const res = await getOrderDetailRoute(req, { params: { orderNumber: user1OrderNumber } });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
  });

  it('cancels pending order and releases reserved inventory', async () => {
    const req = new NextRequest(`http://localhost:3000/api/orders/${user1OrderNumber}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Changed mind before payment' }),
    });
    req.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const res = await cancelOrderRoute(req, { params: { orderNumber: user1OrderNumber } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('cancelled');

    // Verify order detail reflects cancelled state
    const detailReq = new NextRequest(`http://localhost:3000/api/orders/${user1OrderNumber}`);
    detailReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);
    const detailRes = await getOrderDetailRoute(detailReq, { params: { orderNumber: user1OrderNumber } });
    const detailJson = await detailRes.json();
    expect(detailJson.data.status).toBe('cancelled');
  });
});
