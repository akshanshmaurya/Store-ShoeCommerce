import { NextRequest } from 'next/server';
import { GET as getProductDetailRoute } from '@/app/api/products/[slug]/route';

describe('Storefront Product Detail API Test Suite', () => {
  it('returns complete product detail for a valid slug', async () => {
    const slug = 'veloce-apex-carbon-01';
    const req = new NextRequest(`http://localhost:3000/api/products/${slug}`);
    const res = await getProductDetailRoute(req, { params: { slug } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.slug).toBe(slug);
    expect(json.data.name).toBeDefined();
    expect(json.data.brand).toBeDefined();
    expect(json.data.category).toBeDefined();
    expect(Array.isArray(json.data.variants)).toBe(true);
    expect(json.data.variants.length).toBeGreaterThan(0);
  });

  it('returns 404 NOT_FOUND for a non-existent product slug', async () => {
    const slug = 'non-existent-shoe-model';
    const req = new NextRequest(`http://localhost:3000/api/products/${slug}`);
    const res = await getProductDetailRoute(req, { params: { slug } });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('rejects malformed slug strings with 400 Bad Request', async () => {
    const slug = 'invalid!@#--slug';
    const req = new NextRequest(`http://localhost:3000/api/products/${slug}`);
    const res = await getProductDetailRoute(req, { params: { slug } });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('BAD_REQUEST');
  });

  it('strictly excludes sensitive administrative fields like costPrice from response', async () => {
    const slug = 'veloce-apex-carbon-01';
    const req = new NextRequest(`http://localhost:3000/api/products/${slug}`);
    const res = await getProductDetailRoute(req, { params: { slug } });
    const json = await res.json();

    expect(res.status).toBe(200);
    for (const variant of json.data.variants) {
      expect(variant.costPrice).toBeUndefined();
      expect(variant.costPriceMinor).toBeUndefined();
      expect(variant.supplierId).toBeUndefined();
      expect(variant.warehouseId).toBeUndefined();
    }
  });
});
