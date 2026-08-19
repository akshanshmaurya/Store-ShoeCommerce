"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "../context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function CartDrawer() {
  const { items, totalItems, subtotalMinor, isOpen, closeCart, updateQuantity, removeItem } =
    useCart();

  // Prevent background body scroll when drawer is open
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

  // Keyboard shortcut: Escape to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-surface border-l border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-body font-bold uppercase tracking-wider text-foreground">
              Shopping Bag
            </h2>
            <span className="h-5 px-2 rounded-full bg-primary/10 text-primary text-caption font-bold flex items-center justify-center border border-primary/30">
              {totalItems}
            </span>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-muted transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {items.length > 0 ? (
          <>
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border/60">
              {items.map((item) => (
                <div key={item.variantId} className="py-4 flex gap-4 group">
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="h-20 w-20 rounded-xl bg-background-subtle border border-border/60 overflow-hidden shrink-0 block relative"
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

                  {/* Info & Stepper */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-body-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="text-foreground-subtle hover:text-error p-1 transition-colors"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-caption text-foreground-muted">
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
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-border rounded-lg bg-surface-muted/50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 flex items-center justify-center text-foreground-subtle hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-caption font-mono font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="h-7 w-7 flex items-center justify-center text-foreground-subtle hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <span className="text-body-sm font-bold text-foreground font-mono">
                        {formatCurrency(item.unitPriceMinor * item.quantity, item.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Actions */}
            <div className="p-6 border-t border-border bg-surface-muted/30 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-body font-bold text-foreground">
                  <span>Subtotal</span>
                  <span className="text-heading-3 text-primary font-mono font-bold">
                    {formatCurrency(subtotalMinor, "USD")}
                  </span>
                </div>
                <p className="text-[11px] text-foreground-subtle">
                  Taxes and courier shipping calculated authoritatively at checkout.
                </p>
              </div>

              <div className="space-y-2.5">
                <Link href="/cart" onClick={closeCart} className="block">
                  <Button variant="outline" size="md" className="w-full font-semibold">
                    View Full Bag Details
                  </Button>
                </Link>

                <div className="relative group">
                  <Button
                    variant="primary"
                    size="lg"
                    disabled
                    className="w-full h-12 font-bold shadow-glow opacity-80 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <Badge variant="outline" size="sm" className="text-[10px] uppercase">
                      Phase 7
                    </Badge>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-foreground-subtle">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Complimentary Express Shipping & 30-Day Returns</span>
              </div>
            </div>
          </>
        ) : (
          /* Empty Bag State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-surface-muted border border-border flex items-center justify-center text-foreground-subtle">
              <ShoppingBag className="h-8 w-8 text-primary opacity-60" />
            </div>

            <div className="space-y-1 max-w-xs">
              <h3 className="text-body font-bold text-foreground uppercase tracking-wider">
                Your Bag is Empty
              </h3>
              <p className="text-body-sm text-foreground-muted">
                Explore our carbon-plated racing silhouettes and bespoke Italian calfskin sneakers.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                closeCart();
              }}
              className="font-bold shadow-glow"
            >
              <Link href="/shop" className="flex items-center gap-1.5">
                <span>Browse Footwear</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
