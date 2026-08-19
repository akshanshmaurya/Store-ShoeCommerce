"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchSuggestionResult } from "../types";
import { Search, X, ArrowRight, Sparkles, Tag, Layers, Footprints } from "lucide-react";

interface CatalogSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CatalogSearchModal({ isOpen, onClose }: CatalogSearchModalProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SearchSuggestionResult>({
    products: [],
    categories: [],
    collections: [],
    brands: [],
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Auto-focus input on modal open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSearchTerm("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions({ products: [], categories: [], collections: [], brands: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/catalog/suggestions?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions);
        }
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectSuggestion = (path: string) => {
    onClose();
    router.push(path);
  };

  if (!isOpen) return null;

  const hasSuggestions =
    suggestions.products.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.collections.length > 0 ||
    suggestions.brands.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-border px-4 py-3.5">
          <Search className="h-5 w-5 text-foreground-subtle shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search footwear models, racing carbon plates, calfskin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-foreground placeholder:text-foreground-subtle text-body focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="p-1 text-foreground-subtle hover:text-foreground mr-2"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-caption font-semibold uppercase tracking-wider text-foreground-subtle hover:text-foreground px-2 py-1 rounded bg-surface-muted"
          >
            ESC
          </button>
        </form>

        {/* Suggestions / Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {isLoading && (
            <div className="py-6 text-center text-caption text-foreground-muted animate-pulse">
              Scanning bespoke shoe catalog...
            </div>
          )}

          {!isLoading && searchTerm.trim() && !hasSuggestions && (
            <div className="py-8 text-center space-y-2">
              <Footprints className="h-10 w-10 text-foreground-subtle mx-auto opacity-50" />
              <p className="text-body font-semibold text-foreground">No matching silhouettes found</p>
              <p className="text-caption text-foreground-muted">
                Try searching for &quot;Carbon&quot;, &quot;Marathon&quot;, &quot;Calfskin&quot;, or &quot;Apex&quot;.
              </p>
            </div>
          )}

          {/* Product Matches */}
          {suggestions.products.length > 0 && (
            <div className="space-y-3">
              <div className="text-overline uppercase tracking-wider text-foreground-subtle flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Footwear Models
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.products.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(`/product/${item.slug}`)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-muted border border-transparent hover:border-border transition-all text-left group"
                  >
                    <div className="h-12 w-12 rounded-lg bg-background-subtle border border-border/50 shrink-0 overflow-hidden relative">
                      {item.primaryImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.primaryImage}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.name}
                      </p>
                      <p className="text-caption text-foreground-muted font-mono">
                        ${(item.priceMinor / 100).toFixed(2)} • {item.category}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories & Collections Matches */}
          {(suggestions.categories.length > 0 || suggestions.collections.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
              {suggestions.categories.length > 0 && (
                <div className="space-y-2">
                  <div className="text-overline uppercase tracking-wider text-foreground-subtle flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    Categories
                  </div>
                  <div className="space-y-1">
                    {suggestions.categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(`/shop?category=${cat.slug}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-muted text-body-sm text-foreground hover:text-primary text-left transition-colors"
                      >
                        <span>{cat.name}</span>
                        <span className="text-caption text-foreground-subtle font-mono">
                          {cat.count} {cat.count === 1 ? "model" : "models"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.collections.length > 0 && (
                <div className="space-y-2">
                  <div className="text-overline uppercase tracking-wider text-foreground-subtle flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Curated Collections
                  </div>
                  <div className="space-y-1">
                    {suggestions.collections.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(`/shop?collection=${col.slug}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-muted text-body-sm text-foreground hover:text-primary text-left transition-colors"
                      >
                        <span>{col.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-foreground-subtle" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Default Discovery Suggestions when input is empty */}
          {!searchTerm.trim() && (
            <div className="space-y-4 py-2">
              <div className="text-overline uppercase tracking-wider text-foreground-subtle">
                Popular Discoveries
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Carbon Propulsion Series", href: "/shop?collection=carbon-propulsion" },
                  { label: "Marathon Racing", href: "/shop?category=marathon-racing" },
                  { label: "Bespoke Italian Sneakers", href: "/shop?category=bespoke-sneakers" },
                  { label: "New Arrivals 2026", href: "/shop?collection=new-arrivals" },
                  { label: "Heritage Boots", href: "/shop?category=heritage-boots" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectSuggestion(item.href)}
                    className="px-3 py-1.5 rounded-full border border-border bg-background-subtle hover:border-primary/50 text-caption font-semibold text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View All Search Action */}
        {searchTerm.trim() && (
          <div className="p-3 bg-surface-muted/50 border-t border-border flex items-center justify-between">
            <span className="text-caption text-foreground-muted">
              Press <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">Enter</kbd> to search full catalog
            </span>
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="text-caption font-bold text-primary hover:underline flex items-center gap-1"
            >
              View all results for &quot;{searchTerm}&quot; <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
