import { NextRequest } from 'next/server';
import { GET as getCategoriesRoute } from '@/app/api/categories/route';
import { GET as getCategoryDetailRoute } from '@/app/api/categories/[slug]/route';
import { GET as getCollectionsRoute } from '@/app/api/collections/route';
import { GET as getCollectionDetailRoute } from '@/app/api/collections/[slug]/route';
import { GET as getBrandsRoute } from '@/app/api/brands/route';
import { GET as getBrandDetailRoute } from '@/app/api/brands/[slug]/route';
import { GET as getSuggestionsRoute } from '@/app/api/catalog/suggestions/route';

describe('Storefront Taxonomy & Suggestions API Test Suite', () => {
  // Categories
  it('lists active categories and retrieves single category by slug', async () => {
    const listReq = new NextRequest('http://localhost:3000/api/categories');
    const listRes = await getCategoriesRoute(listReq);
    const listJson = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listJson.success).toBe(true);
    expect(listJson.data.length).toBeGreaterThan(0);

    const firstSlug = listJson.data[0].slug;
    const detailReq = new NextRequest(`http://localhost:3000/api/categories/${firstSlug}`);
    const detailRes = await getCategoryDetailRoute(detailReq, { params: { slug: firstSlug } });
    const detailJson = await detailRes.json();

    expect(detailRes.status).toBe(200);
    expect(detailJson.data.slug).toBe(firstSlug);
  });

  // Collections
  it('lists active collections and retrieves single collection by slug', async () => {
    const listReq = new NextRequest('http://localhost:3000/api/collections');
    const listRes = await getCollectionsRoute(listReq);
    const listJson = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listJson.success).toBe(true);
    expect(listJson.data.length).toBeGreaterThan(0);

    const firstSlug = listJson.data[0].slug;
    const detailReq = new NextRequest(`http://localhost:3000/api/collections/${firstSlug}`);
    const detailRes = await getCollectionDetailRoute(detailReq, { params: { slug: firstSlug } });
    const detailJson = await detailRes.json();

    expect(detailRes.status).toBe(200);
    expect(detailJson.data.slug).toBe(firstSlug);
  });

  // Brands
  it('lists active brands and retrieves single brand by slug', async () => {
    const listReq = new NextRequest('http://localhost:3000/api/brands');
    const listRes = await getBrandsRoute(listReq);
    const listJson = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listJson.success).toBe(true);
    expect(listJson.data.length).toBeGreaterThan(0);

    const firstSlug = listJson.data[0].slug;
    const detailReq = new NextRequest(`http://localhost:3000/api/brands/${firstSlug}`);
    const detailRes = await getBrandDetailRoute(detailReq, { params: { slug: firstSlug } });
    const detailJson = await detailRes.json();

    expect(detailRes.status).toBe(200);
    expect(detailJson.data.slug).toBe(firstSlug);
  });

  // Autocomplete Suggestions
  it('returns suggestions for matching search terms', async () => {
    const req = new NextRequest('http://localhost:3000/api/catalog/suggestions?q=carbon&limit=3');
    const res = await getSuggestionsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.products).toBeDefined();
    expect(json.data.categories).toBeDefined();
  });
});
