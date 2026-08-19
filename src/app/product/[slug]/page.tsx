import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductRepository } from "@/features/catalog/data/product-repository";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { VariantSelector } from "@/features/catalog/components/variant-selector";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await ProductRepository.getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | VELOCE Footwear",
      description: "The requested footwear silhouette does not exist in our catalog.",
    };
  }

  return {
    title: `${product.name} | ${product.brand.name}`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — VELOCE Atelier`,
      description: product.shortDescription,
      images: product.media[0] ? [product.media[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await ProductRepository.getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Fetch related products in the same category
  const allCategoryProducts = await ProductRepository.getProducts({
    categorySlug: product.category.slug,
  });
  const relatedProducts = allCategoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-caption text-foreground-subtle uppercase tracking-wider">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-foreground transition-colors">
          Catalog
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Presentation (Gallery + Variant Selection) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Gallery (7 Cols) */}
        <div className="lg:col-span-7">
          <ProductGallery media={product.media} productName={product.name} />
        </div>

        {/* Right Column: Information & Variant Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-overline uppercase tracking-widest text-primary font-bold font-mono">
                {product.brand.name}
              </span>
              {product.badge && (
                <Badge variant="primary" size="sm">
                  {product.badge}
                </Badge>
              )}
            </div>

            <h1 className="text-display-md md:text-heading-1 font-bold text-foreground tracking-tight">
              {product.name}
            </h1>

            <p className="text-body-sm text-foreground-muted leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Variant Selector (Handles Colors, Sizes, Price deltas, and SKUs) */}
          <VariantSelector product={product} />

          {/* Luxury Feature Pillars */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface/60 border border-border/50">
              <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-caption font-semibold text-foreground">Bespoke Quality</h4>
                <p className="text-[11px] text-foreground-subtle">Certified authentic materials.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface/60 border border-border/50">
              <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-caption font-semibold text-foreground">Fast Dispatch</h4>
                <p className="text-[11px] text-foreground-subtle">Direct from Central Fulfillment.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface/60 border border-border/50">
              <RotateCcw className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-caption font-semibold text-foreground">Complimentary Return</h4>
                <p className="text-[11px] text-foreground-subtle">30 days return window.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface/60 border border-border/50">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-caption font-semibold text-foreground">2-Year Warranty</h4>
                <p className="text-[11px] text-foreground-subtle">Full chassis & upper protection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications & Detailed Narrative */}
      <div className="border-t border-border pt-12 space-y-8">
        <h2 className="text-heading-2 font-bold uppercase tracking-tight text-foreground">
          Engineering & Craftsmanship
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-heading-3 font-semibold text-foreground">
              Sculptural Biomechanics
            </h3>
            <p className="text-body text-foreground-muted leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
            <h3 className="text-body-sm font-semibold uppercase tracking-wider text-foreground">
              Material Composition
            </h3>
            <div className="space-y-3 text-caption">
              <div>
                <span className="text-foreground-subtle block">Upper & Midsole:</span>
                <span className="text-foreground font-medium">{product.material}</span>
              </div>
              <div>
                <span className="text-foreground-subtle block">Target Demographic:</span>
                <span className="text-foreground font-medium">{product.gender} Classification</span>
              </div>
              <div>
                <span className="text-foreground-subtle block">Total Variant SKUs:</span>
                <span className="text-foreground font-medium">{product.variants.length} Configurations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border pt-16 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-2 font-bold uppercase tracking-tight text-foreground">
              Complementary Silhouettes
            </h2>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-body-sm font-semibold text-primary hover:underline uppercase tracking-wider"
            >
              Explore {product.category.name} →
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </main>
  );
}
