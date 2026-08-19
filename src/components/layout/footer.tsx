import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface mt-20 text-foreground-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-primary text-background rounded flex items-center justify-center font-bold text-sm">
                V
              </div>
              <span className="text-body font-bold text-foreground tracking-wider uppercase">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-body-sm leading-relaxed text-foreground-subtle">
              Sculptural geometry meets precision biomechanics. Handcrafted in Tuscany and Northamptonshire.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-foreground">
              Collections
            </h4>
            <ul className="space-y-2 text-caption">
              <li>
                <Link href="/shop" className="hover:text-primary transition-colors">
                  All Footwear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=performance-running" className="hover:text-primary transition-colors">
                  Performance Running
                </Link>
              </li>
              <li>
                <Link href="/shop?category=luxury-lifestyle" className="hover:text-primary transition-colors">
                  Luxury Lifestyle
                </Link>
              </li>
              <li>
                <Link href="/shop?category=heritage-boots" className="hover:text-primary transition-colors">
                  Heritage Boots
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Governance & Engineering */}
          <div className="space-y-3">
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-foreground">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-caption">
              <li>
                <a href="http://localhost:3000" className="hover:text-primary transition-colors">
                  Storefront (Port 3000)
                </a>
              </li>
              <li>
                <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  Warehouse Operations (Port 3001)
                </a>
              </li>
              <li>
                <a href="http://localhost:3002" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  Business Intelligence (Port 3002)
                </a>
              </li>
            </ul>
          </div>

          {/* Atelier Services */}
          <div className="space-y-3">
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-foreground">
              Client Care
            </h4>
            <ul className="space-y-2 text-caption text-foreground-subtle">
              <li>Complimentary Express Shipping</li>
              <li>30-Day Bespoke Returns</li>
              <li>Lifetime Sole Restoration</li>
              <li>Authenticity Guaranteed</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-caption text-foreground-subtle gap-4">
          <p>© 2026 VELOCE Footwear Platform. Phase 2 Product Catalog Foundation.</p>
          <div className="flex gap-4 font-mono text-[11px]">
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>TypeScript Domain Layer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
