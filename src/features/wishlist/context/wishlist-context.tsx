"use client";

import * as React from "react";
import { WishlistItem } from "../types";
import { Product, ProductCardData } from "@/features/catalog/types";
import { StorageAdapter } from "@/lib/storage/storage-adapter";

const WISHLIST_STORAGE_KEY = "veloce_wishlist_v1";
const WISHLIST_SCHEMA_VERSION = 1;

interface WishlistContextValue {
  items: WishlistItem[];
  totalItems: number;
  isHydrated: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product | ProductCardData) => void;
  addToWishlist: (product: Product | ProductCardData) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = React.createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate wishlist from StorageAdapter on mount
  React.useEffect(() => {
    const saved = StorageAdapter.getItem<WishlistItem[]>(
      WISHLIST_STORAGE_KEY,
      WISHLIST_SCHEMA_VERSION
    );
    if (saved && Array.isArray(saved)) {
      setItems(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save changes to StorageAdapter after hydration
  React.useEffect(() => {
    if (isHydrated) {
      StorageAdapter.setItem(WISHLIST_STORAGE_KEY, items, WISHLIST_SCHEMA_VERSION);
    }
  }, [items, isHydrated]);

  const totalItems = items.length;

  const isInWishlist = React.useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  const addToWishlist = (product: Product | ProductCardData) => {
    if (isInWishlist(product.id)) return;

    let primaryImage = "";
    let brandName = "";
    let basePriceMinor = 0;
    let compareAtPriceMinor: number | undefined;
    let currency = "USD";
    let categoryName = "";

    if ("brand" in product) {
      // Product entity
      primaryImage =
        product.media.find((m) => m.role === "PRIMARY")?.url ||
        product.media[0]?.url ||
        "";
      brandName = product.brand.name;
      basePriceMinor = product.basePriceMinor;
      compareAtPriceMinor = product.baseCompareAtPriceMinor;
      currency = product.currency;
      categoryName = product.category.name;
    } else {
      // ProductCardData entity
      primaryImage = product.primaryImageUrl;
      brandName = product.brandName;
      basePriceMinor = product.priceMinor;
      compareAtPriceMinor = product.compareAtPriceMinor;
      currency = product.currency;
      categoryName = product.categoryName;
    }

    const newItem: WishlistItem = {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      brandName,
      primaryImage,
      basePriceMinor,
      compareAtPriceMinor,
      currency,
      badge: product.badge,
      categoryName,
      addedAt: new Date().toISOString(),
    };

    setItems((prev) => [...prev, newItem]);
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const toggleWishlist = (product: Product | ProductCardData) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalItems,
        isHydrated,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = React.useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
