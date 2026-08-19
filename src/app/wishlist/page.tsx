"use client";

import * as React from "react";
import Link from "next/link";
import { useWishlist } from "@/features/wishlist/context/wishlist-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, ArrowRight, Sparkles, Footprints } from "lucide-react";

export default function WishlistPage() {
  const { items, totalItems, removeFromWishlist, clearWishlist, isHydrated } =
    useWishlist();

  if (!isHydrated) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full animate-pulse space-y-8">
        <div className="h-10 w-48 bg-surface-muted rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 bg-surface-muted rounded-2xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Phase 5 Saved Wishlist
            </Badge>
          </div>
          <h1 className="text-display-md md:text-display-lg font-bold text-foreground uppercase tracking-tight">
            Curated Wishlist ({totalItems})
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="text-caption text-foreground-subtle hover:text-error font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="group rounded-2xl border border-border bg-surface overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Product Media */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-background-subtle">
                <Link href={`/product/${item.slug}`} className="block h-full w-full">
                  {item.primaryImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.primaryImage}
                      alt={item.productName}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </Link>

                {item.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant="primary" size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                )}

                {/* Remove from Wishlist */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.productId)}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-border/80 flex items-center justify-center text-primary hover:bg-error/20 hover:text-error hover:border-error/40 transition-colors"
                >
                  <Heart className="h-4 w-4 fill-primary" />
                </button>
              </div>

              {/* Card Meta & CTA */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-overline uppercase tracking-widest text-primary font-bold font-mono">
                    {item.brandName}
                  </span>
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="text-body font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {item.productName}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 pt-1">
                    {item.compareAtPriceMinor && item.compareAtPriceMinor > item.basePriceMinor && (
                      <span className="text-caption line-through text-foreground-subtle">
                        {formatCurrency(item.compareAtPriceMinor, item.currency)}
                      </span>
                    )}
                    <span className="text-body-sm font-bold text-foreground font-mono">
                      {formatCurrency(item.basePriceMinor, item.currency)}
                    </span>
                  </div>
                </div>

                {/* Direct Action to Select Size/Color on Detail Page */}
                <Link href={`/product/${item.slug}`} className="block">
                  <Button variant="outline" size="sm" className="w-full text-caption font-bold">
                    Select Size & Color →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Wishlist State */
        <div className="py-20 px-6 text-center rounded-2xl border border-dashed border-border bg-surface/30 space-y-6">
          <div className="h-20 w-20 rounded-full bg-surface-muted border border-border mx-auto flex items-center justify-center text-foreground-subtle">
            <Heart className="h-10 w-10 text-primary opacity-60" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-heading-2 font-bold text-foreground uppercase tracking-tight">
              Your Wishlist is Empty
            </h2>
            <p className="text-body-sm text-foreground-muted leading-relaxed">
              Save your favorite carbon-plated silhouettes and bespoke sneakers to monitor private releases and sizing availability.
            </p>
          </div>

          <Link href="/shop" className="inline-block pt-2">
            <Button variant="primary" size="lg" className="font-bold shadow-glow">
              Explore Footwear Catalog
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
