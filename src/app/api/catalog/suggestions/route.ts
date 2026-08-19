import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/features/catalog/data/product-repository';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || '';
  const limitParam = req.nextUrl.searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 5;

  const suggestions = await ProductRepository.getSearchSuggestions(query, limit);

  return NextResponse.json({
    success: true,
    query,
    suggestions,
  });
}
