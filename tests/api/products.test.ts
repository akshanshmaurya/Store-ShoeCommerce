import { NextRequest } from 'next/server';
import { GET as getProductsRoute } from '@/app/api/products/route';

describe('Storefront Products API Test Suite', () => {
  it('returns paginated list of products with standard envelope and facets', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?page=1&limit=6');
    const res = await getProductsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeLessThanOrEqual(6);
    expect(json.meta).toBeDefined();
    expect(json.meta.page).toBe(1);
    expect(json.meta.limit).toBe(6);
    expect(json.meta.total).toBeGreaterThan(0);
    expect(json.meta.facets).toBeDefined();
    expect(json.meta.facets.categories.length).toBeGreaterThan(0);
    expect(json.meta.facets.priceRange).toBeDefined();
  });

  it('filters products by search keyword across name, brand, material, and tags', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?search=carbon');
    const res = await getProductsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    for (const item of json.data) {
      const corpus = [
        item.name,
        item.brand?.name,
        item.category?.name,
        ...(item.collections || []).map((c: any) => c.name),
        item.material,
        ...(item.tags || []),
        item.shortDescription,
        item.description,
      ]
        .join(' ')
        .toLowerCase();
      expect(corpus.includes('carbon')).toBe(true);
    }
  });

  it('filters products by category slug', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?category=marathon-racing');
    const res = await getProductsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    for (const item of json.data) {
      expect(item.category.slug).toBe('marathon-racing');
    }
  });

  it('filters products by brand slug', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?brand=veloce-lab');
    const res = await getProductsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    for (const item of json.data) {
      expect(item.brand.slug).toBe('veloce-lab');
    }
  });

  it('sorts products by price ascending and price descending', async () => {
    // Ascending
    const reqAsc = new NextRequest('http://localhost:3000/api/products?sort=price-asc');
    const resAsc = await getProductsRoute(reqAsc);
    const jsonAsc = await resAsc.json();

    expect(resAsc.status).toBe(200);
    for (let i = 1; i < jsonAsc.data.length; i++) {
      expect(jsonAsc.data[i].basePriceMinor).toBeGreaterThanOrEqual(jsonAsc.data[i - 1].basePriceMinor);
    }

    // Descending
    const reqDesc = new NextRequest('http://localhost:3000/api/products?sort=price-desc');
    const resDesc = await getProductsRoute(reqDesc);
    const jsonDesc = await resDesc.json();

    expect(resDesc.status).toBe(200);
    for (let i = 1; i < jsonDesc.data.length; i++) {
      expect(jsonDesc.data[i].basePriceMinor).toBeLessThanOrEqual(jsonDesc.data[i - 1].basePriceMinor);
    }
  });

  it('rejects invalid sort parameter with 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?sort=invalid-sort');
    const res = await getProductsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('BAD_REQUEST');
  });

  it('rejects invalid gender parameter with 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?gender=alien');
    const res = await getProductsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('BAD_REQUEST');
  });

  it('clamps maximum pagination limit to 50', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?limit=500');
    const res = await getProductsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.meta.limit).toBe(50);
  });
});
