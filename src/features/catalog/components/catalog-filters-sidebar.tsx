"use client";

import * as React from "react";
import { AvailableFilters, CatalogQuery, GenderCategory } from "../types";
import { ChevronDown, ChevronUp, Check, SlidersHorizontal } from "lucide-react";

interface CatalogFiltersSidebarProps {
  availableFilters: AvailableFilters;
  currentQuery: CatalogQuery;
  onFilterChange: (updated: Partial<CatalogQuery>) => void;
  onResetFilters: () => void;
}

export function CatalogFiltersSidebar({
  availableFilters,
  currentQuery,
  onFilterChange,
  onResetFilters,
}: CatalogFiltersSidebarProps) {
  // Accordion state
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    genders: true,
    sizes: true,
    colors: true,
    price: true,
    collections: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper toggle handlers
  const toggleCategory = (slug: string) => {
    const active = currentQuery.categorySlugs || [];
    const next = active.includes(slug)
      ? active.filter((s) => s !== slug)
      : [...active, slug];
    onFilterChange({ categorySlugs: next, page: 1 });
  };

  const toggleBrand = (slug: string) => {
    const active = currentQuery.brandSlugs || [];
    const next = active.includes(slug)
      ? active.filter((s) => s !== slug)
      : [...active, slug];
    onFilterChange({ brandSlugs: next, page: 1 });
  };

  const toggleCollection = (slug: string) => {
    const active = currentQuery.collectionSlugs || [];
    const next = active.includes(slug)
      ? active.filter((s) => s !== slug)
      : [...active, slug];
    onFilterChange({ collectionSlugs: next, page: 1 });
  };

  const toggleGender = (gender: GenderCategory) => {
    const active = currentQuery.genders || [];
    const next = active.includes(gender)
      ? active.filter((g) => g !== gender)
      : [...active, gender];
    onFilterChange({ genders: next, page: 1 });
  };

  const toggleSize = (sizeVal: string) => {
    const active = currentQuery.sizes || [];
    const next = active.includes(sizeVal)
      ? active.filter((s) => s !== sizeVal)
      : [...active, sizeVal];
    onFilterChange({ sizes: next, page: 1 });
  };

  const toggleColor = (colorKey: string) => {
    const active = currentQuery.colors || [];
    const next = active.includes(colorKey)
      ? active.filter((c) => c !== colorKey)
      : [...active, colorKey];
    onFilterChange({ colors: next, page: 1 });
  };

  const setPriceTier = (minMinor?: number, maxMinor?: number) => {
    onFilterChange({
      minPriceMinor: minMinor,
      maxPriceMinor: maxMinor,
      page: 1,
    });
  };

  const hasActiveFilters =
    (currentQuery.categorySlugs && currentQuery.categorySlugs.length > 0) ||
    (currentQuery.brandSlugs && currentQuery.brandSlugs.length > 0) ||
    (currentQuery.collectionSlugs && currentQuery.collectionSlugs.length > 0) ||
    (currentQuery.genders && currentQuery.genders.length > 0) ||
    (currentQuery.sizes && currentQuery.sizes.length > 0) ||
    (currentQuery.colors && currentQuery.colors.length > 0) ||
    currentQuery.minPriceMinor !== undefined ||
    currentQuery.maxPriceMinor !== undefined;

  return (
    <aside className="w-full space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-body font-bold uppercase tracking-wider text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filter Footwear
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-caption text-primary hover:underline font-semibold uppercase tracking-wider"
          >
            Reset All
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-3 pb-5 border-b border-border/60">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between text-body-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary"
        >
          <span>Category</span>
          {openSections.categories ? (
            <ChevronUp className="h-4 w-4 text-foreground-subtle" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-subtle" />
          )}
        </button>

        {openSections.categories && (
          <div className="space-y-2 pt-1">
            {availableFilters.categories.map((cat) => {
              const isSelected = (currentQuery.categorySlugs || []).includes(cat.slug);
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between text-body-sm text-foreground-muted hover:text-foreground cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCategory(cat.slug)}
                      className="rounded border-border bg-surface text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <span className={isSelected ? "text-foreground font-semibold" : ""}>
                      {cat.name}
                    </span>
                  </span>
                  <span className="text-caption text-foreground-subtle font-mono">
                    {cat.count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Sizing Swatches */}
      <div className="space-y-3 pb-5 border-b border-border/60">
        <button
          type="button"
          onClick={() => toggleSection("sizes")}
          className="w-full flex items-center justify-between text-body-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary"
        >
          <span>Shoe Size (US)</span>
          {openSections.sizes ? (
            <ChevronUp className="h-4 w-4 text-foreground-subtle" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-subtle" />
          )}
        </button>

        {openSections.sizes && (
          <div className="grid grid-cols-4 gap-2 pt-1">
            {availableFilters.sizes.map((sz) => {
              const isSelected = (currentQuery.sizes || []).includes(sz.value);
              return (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => toggleSize(sz.value)}
                  className={`h-10 rounded-lg text-caption font-mono font-bold transition-all border ${
                    isSelected
                      ? "bg-primary text-background border-primary shadow-glow"
                      : "bg-surface text-foreground-muted border-border hover:border-foreground-muted hover:text-foreground"
                  }`}
                  aria-pressed={isSelected}
                >
                  {sz.value}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Color Swatches */}
      <div className="space-y-3 pb-5 border-b border-border/60">
        <button
          type="button"
          onClick={() => toggleSection("colors")}
          className="w-full flex items-center justify-between text-body-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary"
        >
          <span>Colorways</span>
          {openSections.colors ? (
            <ChevronUp className="h-4 w-4 text-foreground-subtle" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-subtle" />
          )}
        </button>

        {openSections.colors && (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {availableFilters.colors.map((clr) => {
              const isSelected = (currentQuery.colors || []).includes(clr.value);
              return (
                <button
                  key={clr.id}
                  type="button"
                  onClick={() => toggleColor(clr.value)}
                  title={clr.name}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-caption transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-glow"
                      : "border-border bg-surface text-foreground-muted hover:text-foreground hover:border-foreground-muted"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0 shadow-sm"
                    style={{ backgroundColor: clr.hex || "#333" }}
                  />
                  <span>{clr.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Gender Filter */}
      <div className="space-y-3 pb-5 border-b border-border/60">
        <button
          type="button"
          onClick={() => toggleSection("genders")}
          className="w-full flex items-center justify-between text-body-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary"
        >
          <span>Gender</span>
          {openSections.genders ? (
            <ChevronUp className="h-4 w-4 text-foreground-subtle" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-subtle" />
          )}
        </button>

        {openSections.genders && (
          <div className="space-y-2 pt-1">
            {availableFilters.genders.map((gen) => {
              const isSelected = (currentQuery.genders || []).includes(gen.value);
              return (
                <label
                  key={gen.id}
                  className="flex items-center justify-between text-body-sm text-foreground-muted hover:text-foreground cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleGender(gen.value)}
                      className="rounded border-border bg-surface text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <span className={isSelected ? "text-foreground font-semibold" : ""}>
                      {gen.name}
                    </span>
                  </span>
                  <span className="text-caption text-foreground-subtle font-mono">
                    {gen.count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Price Tiers */}
      <div className="space-y-3 pb-5 border-b border-border/60">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-body-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary"
        >
          <span>Price Range</span>
          {openSections.price ? (
            <ChevronUp className="h-4 w-4 text-foreground-subtle" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-subtle" />
          )}
        </button>

        {openSections.price && (
          <div className="space-y-2 pt-1 text-body-sm">
            {[
              { label: "All Prices", min: undefined, max: undefined },
              { label: "Under $250", min: undefined, max: 25000 },
              { label: "$250 – $320", min: 25000, max: 32000 },
              { label: "$320 – $400", min: 32000, max: 40000 },
              { label: "$400 & Above", min: 40000, max: undefined },
            ].map((tier, idx) => {
              const isSelected =
                currentQuery.minPriceMinor === tier.min &&
                currentQuery.maxPriceMinor === tier.max;
              return (
                <label
                  key={idx}
                  className="flex items-center gap-2.5 text-foreground-muted hover:text-foreground cursor-pointer"
                >
                  <input
                    type="radio"
                    name="priceTier"
                    checked={isSelected}
                    onChange={() => setPriceTier(tier.min, tier.max)}
                    className="border-border bg-surface text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  <span className={isSelected ? "text-primary font-bold" : ""}>
                    {tier.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Brand Filter */}
      <div className="space-y-3 pb-5 border-b border-border/60">
        <button
          type="button"
          onClick={() => toggleSection("brands")}
          className="w-full flex items-center justify-between text-body-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary"
        >
          <span>Brand</span>
          {openSections.brands ? (
            <ChevronUp className="h-4 w-4 text-foreground-subtle" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-subtle" />
          )}
        </button>

        {openSections.brands && (
          <div className="space-y-2 pt-1">
            {availableFilters.brands.map((b) => {
              const isSelected = (currentQuery.brandSlugs || []).includes(b.slug);
              return (
                <label
                  key={b.id}
                  className="flex items-center justify-between text-body-sm text-foreground-muted hover:text-foreground cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBrand(b.slug)}
                      className="rounded border-border bg-surface text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <span className={isSelected ? "text-foreground font-semibold" : ""}>
                      {b.name}
                    </span>
                  </span>
                  <span className="text-caption text-foreground-subtle font-mono">
                    {b.count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Curated Collections */}
      <div className="space-y-3 pb-2">
        <button
          type="button"
          onClick={() => toggleSection("collections")}
          className="w-full flex items-center justify-between text-body-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary"
        >
          <span>Collections</span>
          {openSections.collections ? (
            <ChevronUp className="h-4 w-4 text-foreground-subtle" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-subtle" />
          )}
        </button>

        {openSections.collections && (
          <div className="space-y-2 pt-1">
            {availableFilters.collections.map((col) => {
              const isSelected = (currentQuery.collectionSlugs || []).includes(col.slug);
              return (
                <label
                  key={col.id}
                  className="flex items-center justify-between text-body-sm text-foreground-muted hover:text-foreground cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCollection(col.slug)}
                      className="rounded border-border bg-surface text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <span className={isSelected ? "text-foreground font-semibold" : ""}>
                      {col.name}
                    </span>
                  </span>
                  <span className="text-caption text-foreground-subtle font-mono">
                    {col.count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
