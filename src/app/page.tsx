import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductRepository } from "@/features/catalog/data/product-repository";
import { ProductCard } from "@/features/catalog/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Layers, Box } from "lucide-react";

export default async function HomePage() {
  const [featuredProducts, categories, collections] = await Promise.all([
    ProductRepository.getFeaturedProducts(4),
    ProductRepository.getCategories(),
    ProductRepository.getCollections(),
  ]);

  return (
    <main className="flex-1 flex flex-col w-full space-y-24 pb-20">
      {/* 1. Cinematic Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-border/80 bg-background">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center space-y-8 z-10">
          <Badge variant="primary" size="md">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Phase 2 — Product Catalog & Variant Engine Active
          </Badge>

          <div className="space-y-4 max-w-4xl">
            <h1 className="text-display-lg sm:text-display-xl font-extrabold tracking-tight text-foreground uppercase leading-none">
              Sculpted For Speed. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-primary-active">
                Engineered In Luxury.
              </span>
            </h1>
            <p className="text-body-lg text-foreground-muted max-w-2xl mx-auto leading-relaxed">
              Explore footwear designed at the intersection of aerospace carbon composite propulsion and generational Italian leather craftsmanship.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/shop">
              <Button variant="primary" size="lg" className="h-14 px-8 text-body font-bold shadow-glow">
                Explore Full Catalog
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/shop?collection=carbon-propulsion">
              <Button variant="secondary" size="lg" className="h-14 px-8 text-body font-semibold">
                Carbon Series
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border/50 max-w-3xl w-full text-center">
            <div>
              <div className="text-heading-2 font-bold text-foreground font-mono">14+</div>
              <div className="text-overline uppercase tracking-widest text-foreground-subtle">Curated Models</div>
            </div>
            <div>
              <div className="text-heading-2 font-bold text-foreground font-mono">100%</div>
              <div className="text-overline uppercase tracking-widest text-foreground-subtle">SKU Isolated</div>
            </div>
            <div>
              <div className="text-heading-2 font-bold text-foreground font-mono">88%</div>
              <div className="text-overline uppercase tracking-widest text-foreground-subtle">Pebax Return</div>
            </div>
            <div>
              <div className="text-heading-2 font-bold text-foreground font-mono">UTC</div>
              <div className="text-overline uppercase tracking-widest text-foreground-subtle">Minor Unit Math</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Silhouettes Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-overline uppercase tracking-widest text-primary font-mono font-bold">
              Flagship Drops
            </span>
            <h2 className="text-display-md font-bold uppercase tracking-tight text-foreground mt-1">
              Featured Footwear
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-body-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
          >
            View All Silhouettes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, idx) => {
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
      </section>

      {/* 3. Category Architecture Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="space-y-2 border-b border-border pb-6">
          <span className="text-overline uppercase tracking-widest text-primary font-mono font-bold">
            Curated Disciplines
          </span>
          <h2 className="text-display-md font-bold uppercase tracking-tight text-foreground">
            Explore By Category
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group p-6 rounded-xl border border-border bg-surface hover:border-primary/50 transition-all duration-300 flex flex-col justify-between space-y-6 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-heading-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-caption text-foreground-muted leading-relaxed">
                  {category.description}
                </p>
              </div>

              <span className="text-overline uppercase tracking-widest text-primary font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Shop Category <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Platform Architecture & Boundary Governance Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-surface to-background p-8 md:p-12 space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="primary">Architectural Separation</Badge>
            <span className="text-caption text-foreground-subtle">
              Governed by AGENTS.md Constitution
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2 p-5 rounded-xl border border-border/80 bg-background/60">
              <div className="flex items-center gap-2 text-foreground font-semibold text-body-sm">
                <Shield className="h-4 w-4 text-primary" />
                Product vs Variant Isolation
              </div>
              <p className="text-caption text-foreground-muted leading-relaxed">
                Stock is never attached to the parent shoe. Inventory and pricing attach strictly to unique color/size SKUs.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-xl border border-border/80 bg-background/60">
              <div className="flex items-center gap-2 text-foreground font-semibold text-body-sm">
                <Box className="h-4 w-4 text-primary" />
                Zero Cross-App Code Leaks
              </div>
              <p className="text-caption text-foreground-muted leading-relaxed">
                Storefront, Warehouse, and Analytics run as three independent Next.js clients consuming unified domain contracts.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-xl border border-border/80 bg-background/60">
              <div className="flex items-center gap-2 text-foreground font-semibold text-body-sm">
                <Layers className="h-4 w-4 text-primary" />
                Exact Minor Currency Representation
              </div>
              <p className="text-caption text-foreground-muted leading-relaxed">
                All pricing is modeled in integer cents/minor units to prevent floating-point financial drift.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
