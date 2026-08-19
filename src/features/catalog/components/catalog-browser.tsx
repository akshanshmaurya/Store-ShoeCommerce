"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CatalogResult, CatalogQuery, CatalogSortOption, GenderCategory } from "../types";
import { CatalogFiltersSidebar } from "./catalog-filters-sidebar";
import { CatalogMobileFilterDrawer } from "./catalog-mobile-filter-drawer";
import { CatalogActiveFilters } from "./catalog-active-filters";
import { CatalogSortSelect } from "./catalog-sort-select";
import { CatalogPagination } from "./catalog-pagination";
import { ProductGrid } from "./product-grid";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Sparkles, Footprints, RotateCcw } from "lucide-react";

interface CatalogBrowserProps {
  initialResult: CatalogResult;
  initialQuery: CatalogQuery;
  title?: string;
  description?: string;
  contextBadge?: string;
}

export function CatalogBrowser({
  initialResult,
  initialQuery,
  title = "All Footwear",
  description = "Engineered silhouettes combining autoclaved carbon plates and bespoke Italian calfskin leather.",
  contextBadge = "Phase 4 Discovery Engine",
}: CatalogBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [result, setResult] = React.useState<CatalogResult>(initialResult);
  const [currentQuery, setCurrentQuery] = React.useState<CatalogQuery>(initialQuery);
  const [isSearching, setIsSearching] = React.useState(false);

  // Sync with incoming server props when SSR props change
  React.useEffect(() => {
    setResult(initialResult);
    setCurrentQuery(initialQuery);
  }, [initialResult, initialQuery]);

  // Synchronize state changes to URL query parameters
  const applyQueryToUrl = React.useCallback(
    (query: CatalogQuery) => {
      const params = new URLSearchParams();

      if (query.search) params.set("q", query.search);
      if (query.categorySlugs && query.categorySlugs.length > 0) {
        params.set("category", query.categorySlugs.join(","));
      }
      if (query.collectionSlugs && query.collectionSlugs.length > 0) {
        params.set("collection", query.collectionSlugs.join(","));
      }
      if (query.brandSlugs && query.brandSlugs.length > 0) {
        params.set("brand", query.brandSlugs.join(","));
      }
      if (query.genders && query.genders.length > 0) {
        params.set("gender", query.genders.join(","));
      }
      if (query.sizes && query.sizes.length > 0) {
        params.set("size", query.sizes.join(","));
      }
      if (query.colors && query.colors.length > 0) {
        params.set("color", query.colors.join(","));
      }
      if (query.minPriceMinor !== undefined) {
        params.set("minPrice", query.minPriceMinor.toString());
      }
      if (query.maxPriceMinor !== undefined) {
        params.set("maxPrice", query.maxPriceMinor.toString());
      }
      if (query.sortBy && query.sortBy !== "featured") {
        params.set("sort", query.sortBy);
      }
      if (query.page && query.page > 1) {
        params.set("page", query.page.toString());
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  const handleFilterChange = (updated: Partial<CatalogQuery>) => {
    const nextQuery = { ...currentQuery, ...updated, page: updated.page || 1 };
    setCurrentQuery(nextQuery);
    applyQueryToUrl(nextQuery);
  };

  const handleResetFilters = () => {
    const nextQuery: CatalogQuery = {
      search: currentQuery.search, // preserve search keyword if present
      sortBy: "featured",
      page: 1,
      pageSize: 9,
    };
    setCurrentQuery(nextQuery);
    applyQueryToUrl(nextQuery);
  };

  const handleSortChange = (sort: CatalogSortOption) => {
    handleFilterChange({ sortBy: sort, page: 1 });
  };

  const handlePageChange = (page: number) => {
    handleFilterChange({ page });
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // Count active filter conditions for the mobile trigger badge
  const activeFiltersCount =
    (currentQuery.categorySlugs?.length || 0) +
    (currentQuery.brandSlugs?.length || 0) +
    (currentQuery.collectionSlugs?.length || 0) +
    (currentQuery.genders?.length || 0) +
    (currentQuery.sizes?.length || 0) +
    (currentQuery.colors?.length || 0) +
    (currentQuery.minPriceMinor !== undefined || currentQuery.maxPriceMinor !== undefined ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="space-y-4 border-b border-border pb-8">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/30">
            <Sparkles className="h-3 w-3 mr-1" />
            {contextBadge}
          </span>
          {currentQuery.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-semibold bg-surface border border-border text-foreground">
              Search: &quot;{currentQuery.search}&quot;
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-display-lg md:text-display-xl font-bold tracking-tight text-foreground uppercase">
              {title}
            </h1>
            <p className="text-body-sm md:text-body text-foreground-muted max-w-2xl mt-2">
              {description}
            </p>
          </div>

          <div className="text-caption text-foreground-subtle font-mono">
            {result.total} {result.total === 1 ? "Footwear Silhouette" : "Footwear Silhouettes"}
          </div>
        </div>

        {/* Active Filter Chips */}
        <CatalogActiveFilters
          availableFilters={result.availableFilters}
          currentQuery={currentQuery}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Control Bar (Mobile Filter Button & Sort Selector) */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/50">
        {/* Mobile Filter Button */}
        <Button
          variant="outline"
          size="md"
          onClick={() => setMobileDrawerOpen(true)}
          className="lg:hidden flex items-center gap-2 text-caption font-semibold"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="h-5 w-5 rounded-full bg-primary text-background text-[11px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Total Results Summary */}
        <div className="hidden lg:block text-caption text-foreground-muted">
          Showing <span className="text-foreground font-bold">{result.products.length}</span> of{" "}
          <span className="text-foreground font-bold">{result.total}</span> models
        </div>

        {/* Sort Selector */}
        <CatalogSortSelect
          currentSort={currentQuery.sortBy}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Main Catalog 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Sidebar (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-28 bg-surface/50 border border-border p-6 rounded-2xl backdrop-blur-sm">
          <CatalogFiltersSidebar
            availableFilters={result.availableFilters}
            currentQuery={currentQuery}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Product Grid & Pagination Area (9 cols) */}
        <div className="lg:col-span-9 space-y-8">
          {result.products.length > 0 ? (
            <>
              <ProductGrid
                products={result.products}
                emptyTitle="No footwear models match your filters"
                emptyDescription="Try adjusting your sizing or color selections to explore other silhouettes."
              />

              <CatalogPagination
                currentPage={result.page}
                totalPages={result.totalPages}
                totalResults={result.total}
                pageSize={result.pageSize}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            /* Rich Empty State */
            <div className="py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-surface/30 space-y-5">
              <div className="h-16 w-16 rounded-full bg-surface-muted border border-border mx-auto flex items-center justify-center text-foreground-subtle">
                <Footprints className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-heading-3 font-bold text-foreground">
                  No matching footwear silhouettes
                </h3>
                <p className="text-body-sm text-foreground-muted leading-relaxed">
                  We could not find any models matching your active filter criteria. Try resetting filters or browsing our flagship marathon racing line.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleResetFilters}
                  className="font-bold shadow-glow"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.push("/shop")}
                >
                  View All Footwear
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      <CatalogMobileFilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        availableFilters={result.availableFilters}
        currentQuery={currentQuery}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={result.total}
      />
    </div>
  );
}
