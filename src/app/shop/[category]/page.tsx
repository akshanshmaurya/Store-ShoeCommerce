import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductRepository } from "@/features/catalog/data/product-repository";
import { CatalogBrowser } from "@/features/catalog/components/catalog-browser";
import { CatalogQuery, CatalogSortOption, GenderCategory } from "@/features/catalog/types";

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    collection?: string;
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
  const categories = await ProductRepository.getCategories();
  return categories.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await ProductRepository.getCategoryBySlug(params.category);
  if (!category) {
    return { title: "Category Not Found | VELOCE Footwear" };
  }
  return {
    title: `${category.name} | VELOCE Atelier Catalog`,
    description: category.description || `Browse our collection of ${category.name} models.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await ProductRepository.getCategoryBySlug(params.category);
  if (!category) {
    notFound();
  }

  const query: CatalogQuery = {
    search: searchParams.q,
    categorySlugs: [params.category],
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <CatalogBrowser
        initialResult={result}
        initialQuery={query}
        title={category.name}
        description={category.description || "Discover high-performance and luxury artisanal silhouettes."}
        contextBadge={`Category: ${category.name}`}
      />
    </main>
  );
}
