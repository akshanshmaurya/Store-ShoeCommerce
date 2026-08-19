import { NextRequest } from 'next/server';
import { GET as getProfileRoute, PATCH as patchProfileRoute } from '@/app/api/account/profile/route';
import { GET as getAddressesRoute, POST as postAddressRoute } from '@/app/api/account/addresses/route';
import { PATCH as patchAddressRoute, DELETE as deleteAddressRoute } from '@/app/api/account/addresses/[id]/route';
import { POST as setDefaultAddressRoute } from '@/app/api/account/addresses/[id]/default/route';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { AUTH_COOKIE_NAME } from '@/server/services/auth-service';
import { RateLimiter } from '@/server/utils/rate-limiter';

describe('Storefront Account & Address API Test Suite', () => {
  let user1Cookie = '';
  let user2Cookie = '';
  let createdAddressId = '';

  beforeAll(async () => {
    RateLimiter.clearAll();

    // Register User 1
    const req1 = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `acc_user1_${Date.now()}@veloce.com`,
        password: 'Password123!',
        firstName: 'Marcus',
        lastName: 'Aurelius',
      }),
    });
    const res1 = await registerRoute(req1);
    user1Cookie = res1.cookies.get(AUTH_COOKIE_NAME)!.value;

    // Register User 2
    const req2 = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `acc_user2_${Date.now()}@veloce.com`,
        password: 'Password123!',
        firstName: 'Lucius',
        lastName: 'Verus',
      }),
    });
    const res2 = await registerRoute(req2);
    user2Cookie = res2.cookies.get(AUTH_COOKIE_NAME)!.value;
  });

  it('retrieves and updates customer profile', async () => {
    // 1. GET profile
    const getReq = new NextRequest('http://localhost:3000/api/account/profile');
    getReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const getRes = await getProfileRoute(getReq);
    const getJson = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getJson.success).toBe(true);
    expect(getJson.data.firstName).toBe('Marcus');

    // 2. PATCH profile
    const patchReq = new NextRequest('http://localhost:3000/api/account/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: 'Marcus Imperator',
        phone: '+91 99999 88888',
        preferredSizeSystem: 'EU',
        preferredSizeValue: '44',
      }),
    });
    patchReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const patchRes = await patchProfileRoute(patchReq);
    const patchJson = await patchRes.json();

    expect(patchRes.status).toBe(200);
    expect(patchJson.success).toBe(true);
    expect(patchJson.data.firstName).toBe('Marcus Imperator');
    expect(patchJson.data.profile.preferredSizeSystem).toBe('EU');
    expect(patchJson.data.profile.preferredSizeValue).toBe('44');
  });

  it('creates and lists saved delivery addresses for User 1', async () => {
    // Create address
    const postReq = new NextRequest('http://localhost:3000/api/account/addresses', {
      method: 'POST',
      body: JSON.stringify({
        recipientName: 'Marcus Aurelius',
        phone: '+91 99999 88888',
        line1: 'Palatine Hill, House 1',
        city: 'Rome',
        state: 'Lazio',
        postalCode: '00184',
        country: 'Italy',
        isDefault: true,
      }),
    });
    postReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const postRes = await postAddressRoute(postReq);
    const postJson = await postRes.json();

    expect(postRes.status).toBe(201);
    expect(postJson.success).toBe(true);
    expect(postJson.data.recipientName).toBe('Marcus Aurelius');
    expect(postJson.data.isDefault).toBe(true);
    createdAddressId = postJson.data.id;

    // List addresses
    const listReq = new NextRequest('http://localhost:3000/api/account/addresses');
    listReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const listRes = await getAddressesRoute(listReq);
    const listJson = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listJson.data.length).toBeGreaterThanOrEqual(1);
    expect(listJson.data.some((a: any) => a.id === createdAddressId)).toBe(true);
  });

  it('enforces cross-user isolation: User 2 cannot access, update, or delete User 1 address', async () => {
    // User 2 tries to PATCH User 1's address
    const patchReq = new NextRequest(`http://localhost:3000/api/account/addresses/${createdAddressId}`, {
      method: 'PATCH',
      body: JSON.stringify({ recipientName: 'Hacked Recipient' }),
    });
    patchReq.cookies.set(AUTH_COOKIE_NAME, user2Cookie); // User 2 session

    const patchRes = await patchAddressRoute(patchReq, { params: { id: createdAddressId } });
    const patchJson = await patchRes.json();

    expect(patchRes.status).toBe(404);
    expect(patchJson.success).toBe(false);

    // User 2 tries to DELETE User 1's address
    const delReq = new NextRequest(`http://localhost:3000/api/account/addresses/${createdAddressId}`, {
      method: 'DELETE',
    });
    delReq.cookies.set(AUTH_COOKIE_NAME, user2Cookie);

    const delRes = await deleteAddressRoute(delReq, { params: { id: createdAddressId } });
    expect(delRes.status).toBe(404);
  });

  it('updates and deletes address for the authorized owner (User 1)', async () => {
    // Update
    const patchReq = new NextRequest(`http://localhost:3000/api/account/addresses/${createdAddressId}`, {
      method: 'PATCH',
      body: JSON.stringify({ line2: 'Villa Annex' }),
    });
    patchReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const patchRes = await patchAddressRoute(patchReq, { params: { id: createdAddressId } });
    const patchJson = await patchRes.json();

    expect(patchRes.status).toBe(200);
    expect(patchJson.data.line2).toBe('Villa Annex');

    // Delete
    const delReq = new NextRequest(`http://localhost:3000/api/account/addresses/${createdAddressId}`, {
      method: 'DELETE',
    });
    delReq.cookies.set(AUTH_COOKIE_NAME, user1Cookie);

    const delRes = await deleteAddressRoute(delReq, { params: { id: createdAddressId } });
    expect(delRes.status).toBe(200);
  });
});
