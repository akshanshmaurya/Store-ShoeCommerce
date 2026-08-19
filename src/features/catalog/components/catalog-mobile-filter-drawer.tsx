"use client";

import * as React from "react";
import { AvailableFilters, CatalogQuery } from "../types";
import { CatalogFiltersSidebar } from "./catalog-filters-sidebar";
import { Button } from "@/components/ui/button";
import { X, SlidersHorizontal } from "lucide-react";

interface CatalogMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableFilters: AvailableFilters;
  currentQuery: CatalogQuery;
  onFilterChange: (updated: Partial<CatalogQuery>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export function CatalogMobileFilterDrawer({
  isOpen,
  onClose,
  availableFilters,
  currentQuery,
  onFilterChange,
  onResetFilters,
  totalResults,
}: CatalogMobileFilterDrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-surface border-l border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-body font-bold uppercase tracking-wider text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-muted"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <CatalogFiltersSidebar
            availableFilters={availableFilters}
            currentQuery={currentQuery}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
          />
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-border bg-surface-muted/60 flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onResetFilters}
            className="flex-1 text-caption font-semibold"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="flex-1 text-caption font-bold shadow-glow"
          >
            Show {totalResults} {totalResults === 1 ? "Model" : "Models"}
          </Button>
        </div>
      </div>
    </div>
  );
}
