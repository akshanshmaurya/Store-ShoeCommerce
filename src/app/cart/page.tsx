"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/features/cart/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    totalItems,
    subtotalMinor,
    updateQuantity,
    removeItem,
    clearCart,
    isHydrated,
  } = useCart();

  if (!isHydrated) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full animate-pulse space-y-8">
        <div className="h-10 w-48 bg-surface-muted rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 h-80 bg-surface-muted rounded-2xl" />
          <div className="lg:col-span-4 h-64 bg-surface-muted rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Breadcrumb / Back Action */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Phase 5 Stateful Bag
            </Badge>
          </div>
          <h1 className="text-display-md md:text-display-lg font-bold text-foreground uppercase tracking-tight">
            Your Shopping Bag ({totalItems})
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-caption text-foreground-subtle hover:text-error font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Bag</span>
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-border bg-surface divide-y divide-border/60 overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between group"
                >
                  {/* Thumbnail & Product Details */}
                  <div className="flex gap-5 items-center min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="h-24 w-24 rounded-xl bg-background-subtle border border-border/60 overflow-hidden shrink-0 block relative group"
                    >
                      {item.primaryImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.primaryImage}
                          alt={item.productName}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </Link>

                    <div className="space-y-1.5 min-w-0">
                      <span className="text-overline uppercase tracking-widest text-primary font-bold font-mono">
                        {item.brandName}
                      </span>
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-body font-bold text-foreground hover:text-primary transition-colors block truncate"
                      >
                        {item.productName}
                      </Link>

                      <div className="flex items-center gap-3 text-caption text-foreground-muted">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.name}
                        </span>
                        <span>•</span>
                        <span className="font-mono font-medium">
                          {item.selectedSize.label}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-foreground-subtle text-[11px]">
                          SKU: {item.sku}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price Column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="text-body-sm font-bold text-foreground font-mono">
                      {formatCurrency(item.unitPriceMinor * item.quantity, item.currency)}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-border rounded-lg bg-surface-muted/50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 flex items-center justify-center text-foreground-subtle hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-caption font-mono font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="h-8 w-8 flex items-center justify-center text-foreground-subtle hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="p-1.5 rounded-lg text-foreground-subtle hover:text-error hover:bg-error/10 transition-colors"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-primary hover:underline pt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Continue Browsing Footwear
            </Link>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
              <h2 className="text-body font-bold uppercase tracking-wider text-foreground pb-3 border-b border-border">
                Order Summary
              </h2>

              <div className="space-y-3 text-body-sm">
                <div className="flex items-center justify-between text-foreground-muted">
                  <span>Items Subtotal ({totalItems})</span>
                  <span className="font-mono text-foreground font-semibold">
                    {formatCurrency(subtotalMinor, "USD")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-foreground-muted">
                  <span>Express Courier Dispatch</span>
                  <span className="text-emerald-400 font-medium">Complimentary</span>
                </div>

                <div className="flex items-center justify-between text-foreground-muted">
                  <span>Estimated Taxes & Duty</span>
                  <span className="font-mono text-foreground-subtle text-caption">Calculated at Step 7</span>
                </div>

                <div className="pt-4 border-t border-border flex items-baseline justify-between text-foreground">
                  <span className="text-body font-bold uppercase tracking-wider">Estimated Total</span>
                  <span className="text-display-sm font-bold text-primary font-mono">
                    {formatCurrency(subtotalMinor, "USD")}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  disabled
                  className="w-full h-14 font-bold shadow-glow opacity-80 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <Badge variant="outline" size="sm" className="text-[10px] uppercase">
                    Phase 7
                  </Badge>
                </Button>

                <p className="text-[11px] text-center text-foreground-subtle leading-relaxed">
                  Final authoritative transaction calculation and inventory reservation will take place in the checkout workflow.
                </p>
              </div>

              {/* Pillars */}
              <div className="pt-4 border-t border-border/60 space-y-2.5 text-caption text-foreground-muted">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>2-Year Atelier Upper & Chassis Warranty</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-primary shrink-0" />
                  <span>Dispatched from Central Warehouse</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="h-4 w-4 text-primary shrink-0" />
                  <span>30-Day Bespoke Exchange Window</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="py-20 px-6 text-center rounded-2xl border border-dashed border-border bg-surface/30 space-y-6">
          <div className="h-20 w-20 rounded-full bg-surface-muted border border-border mx-auto flex items-center justify-center text-foreground-subtle">
            <ShoppingBag className="h-10 w-10 text-primary opacity-60" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-heading-2 font-bold text-foreground uppercase tracking-tight">
              Your Bag is Currently Empty
            </h2>
            <p className="text-body-sm text-foreground-muted leading-relaxed">
              You have not added any silhouettes to your shopping bag yet. Explore our marathon carbon propulsion racers and Italian calfskin sneakers.
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
