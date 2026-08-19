"use client";

import * as React from "react";
import { AvailableFilters, CatalogQuery, GenderCategory } from "../types";
import { X, Trash2 } from "lucide-react";

interface CatalogActiveFiltersProps {
  availableFilters: AvailableFilters;
  currentQuery: CatalogQuery;
  onFilterChange: (updated: Partial<CatalogQuery>) => void;
  onResetFilters: () => void;
}

export function CatalogActiveFilters({
  availableFilters,
  currentQuery,
  onFilterChange,
  onResetFilters,
}: CatalogActiveFiltersProps) {
  const chips: { label: string; onRemove: () => void }[] = [];

  // Search keyword chip
  if (currentQuery.search && currentQuery.search.trim()) {
    chips.push({
      label: `Keyword: "${currentQuery.search}"`,
      onRemove: () => onFilterChange({ search: undefined, page: 1 }),
    });
  }

  // Categories
  if (currentQuery.categorySlugs && currentQuery.categorySlugs.length > 0) {
    for (const slug of currentQuery.categorySlugs) {
      const cat = availableFilters.categories.find((c) => c.slug === slug);
      chips.push({
        label: cat ? cat.name : slug,
        onRemove: () => {
          const next = currentQuery.categorySlugs!.filter((s) => s !== slug);
          onFilterChange({ categorySlugs: next, page: 1 });
        },
      });
    }
  }

  // Brands
  if (currentQuery.brandSlugs && currentQuery.brandSlugs.length > 0) {
    for (const slug of currentQuery.brandSlugs) {
      const b = availableFilters.brands.find((item) => item.slug === slug);
      chips.push({
        label: b ? b.name : slug,
        onRemove: () => {
          const next = currentQuery.brandSlugs!.filter((s) => s !== slug);
          onFilterChange({ brandSlugs: next, page: 1 });
        },
      });
    }
  }

  // Collections
  if (currentQuery.collectionSlugs && currentQuery.collectionSlugs.length > 0) {
    for (const slug of currentQuery.collectionSlugs) {
      const col = availableFilters.collections.find((item) => item.slug === slug);
      chips.push({
        label: col ? col.name : slug,
        onRemove: () => {
          const next = currentQuery.collectionSlugs!.filter((s) => s !== slug);
          onFilterChange({ collectionSlugs: next, page: 1 });
        },
      });
    }
  }

  // Genders
  if (currentQuery.genders && currentQuery.genders.length > 0) {
    for (const gen of currentQuery.genders) {
      chips.push({
        label: gen === "MEN" ? "Men" : gen === "WOMEN" ? "Women" : "Unisex",
        onRemove: () => {
          const next = currentQuery.genders!.filter((g) => g !== gen);
          onFilterChange({ genders: next, page: 1 });
        },
      });
    }
  }

  // Sizes
  if (currentQuery.sizes && currentQuery.sizes.length > 0) {
    for (const sz of currentQuery.sizes) {
      chips.push({
        label: `US ${sz}`,
        onRemove: () => {
          const next = currentQuery.sizes!.filter((s) => s !== sz);
          onFilterChange({ sizes: next, page: 1 });
        },
      });
    }
  }

  // Colors
  if (currentQuery.colors && currentQuery.colors.length > 0) {
    for (const clr of currentQuery.colors) {
      const colorObj = availableFilters.colors.find((c) => c.slug === clr);
      chips.push({
        label: colorObj ? colorObj.name : clr,
        onRemove: () => {
          const next = currentQuery.colors!.filter((c) => c !== clr);
          onFilterChange({ colors: next, page: 1 });
        },
      });
    }
  }

  // Price range
  if (currentQuery.minPriceMinor !== undefined || currentQuery.maxPriceMinor !== undefined) {
    let label = "Price: ";
    if (currentQuery.minPriceMinor && currentQuery.maxPriceMinor) {
      label += `$${(currentQuery.minPriceMinor / 100).toFixed(0)} – $${(currentQuery.maxPriceMinor / 100).toFixed(0)}`;
    } else if (currentQuery.maxPriceMinor) {
      label += `Under $${(currentQuery.maxPriceMinor / 100).toFixed(0)}`;
    } else if (currentQuery.minPriceMinor) {
      label += `$${(currentQuery.minPriceMinor / 100).toFixed(0)}+`;
    }

    chips.push({
      label,
      onRemove: () =>
        onFilterChange({ minPriceMinor: undefined, maxPriceMinor: undefined, page: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-overline uppercase tracking-wider text-foreground-subtle mr-1">
        Active Filters:
      </span>
      {chips.map((chip, index) => (
        <button
          key={index}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-semibold bg-surface border border-primary/40 text-foreground hover:border-primary hover:text-primary transition-all group"
        >
          <span>{chip.label}</span>
          <X className="h-3.5 w-3.5 text-foreground-subtle group-hover:text-primary" />
        </button>
      ))}

      <button
        type="button"
        onClick={onResetFilters}
        className="inline-flex items-center gap-1 text-caption text-primary hover:underline font-bold uppercase tracking-wider ml-2"
      >
        <Trash2 className="h-3 w-3" />
        Clear All
      </button>
    </div>
  );
}
