"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductCardData } from "../types";
import { useWishlist } from "@/features/wishlist/context/wishlist-context";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Heart } from "lucide-react";

export interface ProductCardProps {
  product: ProductCardData;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const badgeVariants = {
    NEW: "primary" as const,
    "BEST SELLER": "default" as const,
    LIMITED: "warning" as const,
    SALE: "error" as const,
  };

  const hasDiscount =
    product.compareAtPriceMinor &&
    product.compareAtPriceMinor > product.priceMinor;

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden border border-border bg-surface hover:border-border-focus/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame (3:4 Aspect Ratio) */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-background-subtle block"
      >
        {/* Primary Image */}
        {product.primaryImageUrl && (
          <Image
            src={product.primaryImageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={`object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${
              isHovered && product.secondaryImageUrl
                ? "opacity-0"
                : "opacity-100"
            }`}
          />
        )}

        {/* Secondary Hover Image */}
        {product.secondaryImageUrl && (
          <Image
            src={product.secondaryImageUrl}
            alt={`${product.name} angle`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={`object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 absolute inset-0 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        )}

        {/* Merchandising Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={badgeVariants[product.badge] || "default"}
              size="sm"
            >
              {product.badge}
            </Badge>
          </div>
        )}

        {/* Wishlist Interactive Affordance */}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 h-8 w-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
            wishlisted
              ? "bg-background border-primary text-primary shadow-glow"
              : "bg-background/70 border-border/60 text-foreground-muted hover:text-primary hover:border-primary/50"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wishlisted ? "fill-primary text-primary" : ""
            }`}
          />
        </button>
      </Link>

      {/* Card Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-overline uppercase tracking-widest text-foreground-subtle mb-1">
            <span>{product.brandName}</span>
            <span>{product.categoryName}</span>
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="text-body-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Color Indicators and Price */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          {/* Color Swatch Dots */}
          <div className="flex items-center gap-1.5" title={`${product.colors.length} colorways`}>
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.id}
                className="h-2.5 w-2.5 rounded-full border border-border/80 shadow-sm"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-foreground-subtle">
                +{product.colors.length - 4}
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-caption line-through text-foreground-subtle">
                {formatCurrency(product.compareAtPriceMinor!, product.currency)}
              </span>
            )}
            <span
              className={`text-body-sm font-bold ${
                hasDiscount ? "text-primary" : "text-foreground"
              }`}
            >
              {formatCurrency(product.priceMinor, product.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
