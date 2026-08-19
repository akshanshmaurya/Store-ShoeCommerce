import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductRepository } from "@/features/catalog/data/product-repository";
import { CatalogBrowser } from "@/features/catalog/components/catalog-browser";
import { CatalogQuery, CatalogSortOption, GenderCategory } from "@/features/catalog/types";

interface CollectionPageProps {
  params: {
    collection: string;
  };
  searchParams: {
    category?: string;
    brand?: string;
    gender?: string;
    size?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: CatalogSortOption;
    page?: string;
    q?: string;
  };
}

export async function generateStaticParams() {
  const collections = await ProductRepository.getCollections();
  return collections.map((col) => ({
    collection: col.slug,
  }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collections = await ProductRepository.getCollections();
  const collection = collections.find((c) => c.slug === params.collection);
  if (!collection) {
    return { title: "Collection Not Found | VELOCE Footwear" };
  }
  return {
    title: `${collection.name} | VELOCE Curated Collection`,
    description: collection.description || `Browse models in the ${collection.name} collection.`,
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const collections = await ProductRepository.getCollections();
  const collection = collections.find((c) => c.slug === params.collection);
  if (!collection) {
    notFound();
  }

  const query: CatalogQuery = {
    search: searchParams.q,
    categorySlugs: searchParams.category ? searchParams.category.split(",") : undefined,
    collectionSlugs: [params.collection],
    brandSlugs: searchParams.brand ? searchParams.brand.split(",") : undefined,
    genders: searchParams.gender ? (searchParams.gender.split(",") as GenderCategory[]) : undefined,
    sizes: searchParams.size ? searchParams.size.split(",") : undefined,
    colors: searchParams.color ? searchParams.color.split(",") : undefined,
    minPriceMinor: searchParams.minPrice ? parseInt(searchParams.minPrice, 10) : undefined,
    maxPriceMinor: searchParams.maxPrice ? parseInt(searchParams.maxPrice, 10) : undefined,
    sortBy: searchParams.sort,
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    pageSize: 9,
  };

  const result = await ProductRepository.queryProducts(query);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <CatalogBrowser
        initialResult={result}
        initialQuery={query}
        title={collection.name}
        description={collection.description || "Limited allocations and engineered performance footwear."}
        contextBadge={`Collection: ${collection.name}`}
      />
    </main>
  );
}
