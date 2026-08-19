"use client";

import * as React from "react";
import { CatalogSortOption } from "../types";
import { ArrowUpDown } from "lucide-react";

interface CatalogSortSelectProps {
  currentSort?: CatalogSortOption;
  onSortChange: (sort: CatalogSortOption) => void;
}

export function CatalogSortSelect({ currentSort = "featured", onSortChange }: CatalogSortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="catalog-sort" className="text-overline uppercase tracking-wider text-foreground-subtle hidden sm:inline flex items-center gap-1">
        <ArrowUpDown className="h-3 w-3" />
        Sort By:
      </label>
      <select
        id="catalog-sort"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value as CatalogSortOption)}
        className="h-10 px-3.5 pr-8 rounded-lg border border-border bg-surface text-foreground text-caption font-semibold uppercase tracking-wider focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
      >
        <option value="featured">Featured (Curated)</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest Arrivals</option>
        <option value="name-asc">Alphabetical (A–Z)</option>
      </select>
    </div>
  );
}
