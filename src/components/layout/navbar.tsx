"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/context/cart-context";
import { useWishlist } from "@/features/wishlist/context/wishlist-context";
import { CatalogSearchModal } from "@/features/catalog/components/catalog-search-modal";
import { ShoppingBag, ArrowUpRight, Search, Heart, LogIn } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { totalItems: cartCount, openCart, isHydrated: cartHydrated } = useCart();
  const { totalItems: wishlistCount, isHydrated: wishlistHydrated } = useWishlist();
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 bg-primary text-background rounded-lg flex items-center justify-center font-bold text-lg tracking-wider group-hover:scale-105 transition-transform duration-200 shadow-glow">
                V
              </div>
              <div className="flex flex-col">
                <span className="text-body font-bold tracking-widest text-foreground uppercase">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] tracking-wider text-primary uppercase font-mono">
                  Atelier Footwear
                </span>
              </div>
            </Link>

            {/* Primary Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-body-sm font-semibold uppercase tracking-wider text-foreground-muted">
              <Link href="/shop" className="hover:text-primary transition-colors">
                Catalog
              </Link>
              <Link href="/shop/marathon-racing" className="hover:text-primary transition-colors">
                Racing
              </Link>
              <Link href="/shop/bespoke-sneakers" className="hover:text-primary transition-colors">
                Sneakers
              </Link>
              <Link href="/shop/collections/carbon-propulsion" className="hover:text-primary transition-colors">
                Carbon Series
              </Link>
            </nav>
          </div>

          {/* Right Actions & External App Links */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 pr-4 border-r border-border">
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noreferrer"
                className="text-overline uppercase tracking-wider text-foreground-muted hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                Warehouse <ArrowUpRight className="h-3 w-3" />
              </a>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noreferrer"
                className="text-overline uppercase tracking-wider text-foreground-muted hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                Analytics <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-foreground-muted">
              {/* Interactive Search Modal Trigger */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                aria-label="Search catalog"
                className="p-2 hover:text-foreground transition-colors rounded-lg hover:bg-surface-muted flex items-center gap-1.5"
              >
                <Search className="h-5 w-5" />
                <span className="hidden xl:inline text-caption text-foreground-subtle">
                  Search...
                </span>
              </button>

              {/* Wishlist Link with Live Counter Badge */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="p-2 hover:text-primary transition-colors relative"
              >
                <Heart className="h-5 w-5" />
                {wishlistHydrated && wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-background text-[10px] font-bold flex items-center justify-center shadow-glow">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Dynamic Customer Auth Action */}
              {authLoading ? (
                <div className="h-8 w-8 rounded-full bg-surface-muted animate-pulse" />
              ) : isAuthenticated && user ? (
                <Link
                  href="/account"
                  aria-label="Customer Account"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-caption font-semibold"
                >
                  <div className="h-5 w-5 rounded-full bg-primary text-background font-bold text-[10px] flex items-center justify-center">
                    {user.firstName[0]}
                  </div>
                  <span className="hidden sm:inline">{user.firstName}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  aria-label="Sign in"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface text-foreground-muted hover:text-foreground hover:border-primary/50 transition-colors text-caption font-semibold"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Shopping Bag Trigger Button with Live Quantity Counter */}
              <button
                type="button"
                onClick={openCart}
                aria-label="Shopping Bag"
                className="p-2 hover:text-primary transition-colors relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartHydrated && cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-background text-[10px] font-bold flex items-center justify-center shadow-glow">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Interactive Search Modal */}
      <CatalogSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
