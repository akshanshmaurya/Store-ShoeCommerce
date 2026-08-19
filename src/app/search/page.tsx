import * as React from "react";
import { Metadata } from "next";
import { ProductRepository } from "@/features/catalog/data/product-repository";
import { CatalogBrowser } from "@/features/catalog/components/catalog-browser";
import { CatalogQuery, CatalogSortOption, GenderCategory } from "@/features/catalog/types";

export const metadata: Metadata = {
  title: "Search Footwear | VELOCE Atelier",
  description: "Search and discover high-performance carbon racing shoes and luxury Italian calfskin sneakers.",
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    collection?: string;
    brand?: string;
    gender?: string;
    size?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: CatalogSortOption;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const searchTerm = searchParams.q || "";

  const query: CatalogQuery = {
    search: searchTerm,
    categorySlugs: searchParams.category ? searchParams.category.split(",") : undefined,
    collectionSlugs: searchParams.collection ? searchParams.collection.split(",") : undefined,
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

  const pageTitle = searchTerm
    ? `Search Results for "${searchTerm}"`
    : "Discover Footwear";

  const pageDescription = searchTerm
    ? `Found ${result.total} ${result.total === 1 ? "silhouette" : "silhouettes"} matching your search query.`
    : "Explore the complete VELOCE collection with full-text search, sizing swatches, and technical filters.";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <CatalogBrowser
        initialResult={result}
        initialQuery={query}
        title={pageTitle}
        description={pageDescription}
        contextBadge="Search Discovery"
      />
    </main>
  );
}
