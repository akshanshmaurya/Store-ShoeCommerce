import * as React from "react";
import { Product } from "../types";
import { ProductRepository } from "../data/product-repository";
import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/ui/empty-state";

export interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  emptyTitle = "No footwear found",
  emptyDescription = "There are no shoes currently available matching your selected filters.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel="View All Shoes"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, idx) => {
        const cardData = ProductRepository.toProductCardData(product);
        return (
          <ProductCard
            key={product.id}
            product={cardData}
            priority={idx < 4}
          />
        );
      })}
    </div>
  );
}
