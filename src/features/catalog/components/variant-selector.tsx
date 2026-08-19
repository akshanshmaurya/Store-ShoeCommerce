"use client";

import * as React from "react";
import { Product, ProductVariant, ShoeColor, ShoeSize } from "../types";
import { useCart } from "@/features/cart/context/cart-context";
import { useWishlist } from "@/features/wishlist/context/wishlist-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Check, ShieldAlert, ShoppingBag, Heart, CheckCircle2 } from "lucide-react";

export interface VariantSelectorProps {
  product: Product;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

export function VariantSelector({ product, onVariantChange }: VariantSelectorProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  // Extract all distinct colors available
  const availableColors: ShoeColor[] = React.useMemo(() => {
    const map = new Map<string, ShoeColor>();
    for (const v of product.variants) {
      if (!map.has(v.color.id)) {
        map.set(v.color.id, v.color);
      }
    }
    return Array.from(map.values());
  }, [product.variants]);

  // Extract all distinct sizes available across all variants
  const allSizes: ShoeSize[] = React.useMemo(() => {
    const map = new Map<string, ShoeSize>();
    for (const v of product.variants) {
      if (!map.has(v.size.id)) {
        map.set(v.size.id, v.size);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [product.variants]);

  // Initial state defaults to the first available variant
  const initialVariant = product.variants[0] || null;
  const [selectedColor, setSelectedColor] = React.useState<ShoeColor>(
    initialVariant?.color || availableColors[0]
  );
  const [selectedSize, setSelectedSize] = React.useState<ShoeSize | null>(
    initialVariant?.size || null
  );
  const [justAdded, setJustAdded] = React.useState(false);

  // Set of sizes available for the currently selected color
  const availableSizesForColor = React.useMemo(() => {
    if (!selectedColor) return new Set<string>();
    return new Set(
      product.variants
        .filter((v) => v.color.id === selectedColor.id && v.status === "ACTIVE")
        .map((v) => v.size.id)
    );
  }, [product.variants, selectedColor]);

  // Resolve active variant based on selected color and size
  const activeVariant = React.useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return (
      product.variants.find(
        (v) =>
          v.color.id === selectedColor.id &&
          v.size.id === selectedSize.id &&
          v.status === "ACTIVE"
      ) || null
    );
  }, [product.variants, selectedColor, selectedSize]);

  // Notify parent on change
  React.useEffect(() => {
    if (onVariantChange) {
      onVariantChange(activeVariant);
    }
  }, [activeVariant, onVariantChange]);

  const handleAddToCart = () => {
    if (!activeVariant) return;

    addItem(product, activeVariant, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const currentPrice = activeVariant ? activeVariant.priceMinor : product.basePriceMinor;
  const currentCompareAt = activeVariant
    ? activeVariant.compareAtPriceMinor
    : product.baseCompareAtPriceMinor;
  const hasDiscount = currentCompareAt && currentCompareAt > currentPrice;

  return (
    <div className="space-y-8">
      {/* Price & SKU Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-display-md font-bold text-foreground">
            {formatCurrency(currentPrice, product.currency)}
          </span>
          {hasDiscount && (
            <span className="text-heading-3 line-through text-foreground-subtle">
              {formatCurrency(currentCompareAt!, product.currency)}
            </span>
          )}
          {hasDiscount && (
            <Badge variant="error" size="sm">
              Save {formatCurrency(currentCompareAt! - currentPrice, product.currency)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-caption text-foreground-muted">
          <span>
            SKU:{" "}
            <span className="font-mono text-foreground font-semibold">
              {activeVariant ? activeVariant.sku : "Select Size"}
            </span>
          </span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            ● Available in Atelier
          </span>
        </div>
      </div>

      {/* 1. Color Swatch Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-body-sm font-semibold uppercase tracking-wider text-foreground">
            Color: <span className="text-primary font-normal">{selectedColor?.name}</span>
          </label>
          <span className="text-caption text-foreground-muted">
            {availableColors.length} Options
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {availableColors.map((color) => {
            const isSelected = selectedColor?.id === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => {
                  setSelectedColor(color);
                  // If current size is invalid for new color, auto-select first valid size
                  if (
                    selectedSize &&
                    !product.variants.some(
                      (v) => v.color.id === color.id && v.size.id === selectedSize.id
                    )
                  ) {
                    const firstValid = product.variants.find((v) => v.color.id === color.id);
                    setSelectedSize(firstValid ? firstValid.size : null);
                  }
                }}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-surface-muted ring-2 ring-primary/40"
                    : "border-border bg-surface hover:border-foreground-muted/60"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-border/60 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-caption font-medium text-foreground">
                  {color.name}
                </span>
                {isSelected && <Check className="h-3 w-3 text-primary ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sizing System Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-body-sm font-semibold uppercase tracking-wider text-foreground">
            Size:{" "}
            <span className="text-primary font-normal">
              {selectedSize ? selectedSize.label : "Select Size"}
            </span>
          </label>
          <span className="text-caption text-foreground-muted">
            Standard {selectedSize?.system || "US"} Sizing
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {allSizes.map((size) => {
            const isAvailableForColor = availableSizesForColor.has(size.id);
            const isSelected = selectedSize?.id === size.id && isAvailableForColor;

            return (
              <button
                key={size.id}
                type="button"
                disabled={!isAvailableForColor}
                onClick={() => setSelectedSize(size)}
                className={`h-12 rounded-lg font-semibold text-body-sm transition-all duration-200 flex flex-col items-center justify-center border relative ${
                  !isAvailableForColor
                    ? "border-border/40 bg-surface-muted/30 text-foreground-subtle/40 cursor-not-allowed line-through"
                    : isSelected
                    ? "border-primary bg-primary text-background shadow-glow font-bold"
                    : "border-border bg-surface text-foreground hover:border-border-focus hover:bg-surface-hover"
                }`}
              >
                <span>{size.value}</span>
                <span className="text-[9px] opacity-70 uppercase tracking-tighter">
                  {size.system}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notice for disabled combinations */}
        {selectedSize && !availableSizesForColor.has(selectedSize.id) && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-caption">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>
              Size {selectedSize.value} is not available in {selectedColor.name}. Please choose another size or color.
            </span>
          </div>
        )}
      </div>

      {/* 3. Action CTAs (Add to Cart & Wishlist) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={!activeVariant}
            className="flex-1 h-14 text-body font-bold shadow-glow flex items-center justify-center gap-2"
          >
            {justAdded ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-background" />
                <span>Added to Bag</span>
              </>
            ) : activeVariant ? (
              <>
                <ShoppingBag className="h-5 w-5 mr-1" />
                <span>Add to Shopping Bag</span>
              </>
            ) : (
              <span>Select Available Size</span>
            )}
          </Button>

          {/* Wishlist Button */}
          <button
            type="button"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggleWishlist(product)}
            className={`h-14 w-14 rounded-xl border flex items-center justify-center transition-all ${
              wishlisted
                ? "bg-surface border-primary text-primary shadow-glow"
                : "bg-surface border-border text-foreground-muted hover:border-primary/50 hover:text-primary"
            }`}
          >
            <Heart className={`h-6 w-6 ${wishlisted ? "fill-primary" : ""}`} />
          </button>
        </div>

        <p className="text-center text-overline uppercase tracking-widest text-foreground-subtle">
          Complimentary Worldwide Express Delivery & 30-Day Atelier Returns
        </p>
      </div>
    </div>
  );
}
