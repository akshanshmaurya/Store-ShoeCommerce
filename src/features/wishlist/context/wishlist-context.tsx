"use client";

import * as React from "react";
import { WishlistItem } from "../types";
import { Product, ProductCardData } from "@/features/catalog/types";
import { StorageAdapter } from "@/lib/storage/storage-adapter";
import { useAuth } from "@/features/auth/context/auth-context";

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
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = React.createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const refreshWishlist = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && Array.isArray(json.data.items)) {
          setItems(json.data.items);
          StorageAdapter.setItem(WISHLIST_STORAGE_KEY, json.data.items, WISHLIST_SCHEMA_VERSION);
        }
      }
    } catch {
      // Fallback
    }
  }, [user]);

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

  // Sync with server when user logs in
  React.useEffect(() => {
    if (user && isHydrated) {
      refreshWishlist();
    }
  }, [user, isHydrated, refreshWishlist]);

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

    const updated = [...items, newItem];
    setItems(updated);
    StorageAdapter.setItem(WISHLIST_STORAGE_KEY, updated, WISHLIST_SCHEMA_VERSION);

    // Sync to server if authenticated
    if (user) {
      fetch('/api/wishlist/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data && Array.isArray(json.data.items)) {
            setItems(json.data.items);
            StorageAdapter.setItem(WISHLIST_STORAGE_KEY, json.data.items, WISHLIST_SCHEMA_VERSION);
          }
        })
        .catch(() => {});
    }
  };

  const removeFromWishlist = (productId: string) => {
    const updated = items.filter((item) => item.productId !== productId);
    setItems(updated);
    StorageAdapter.setItem(WISHLIST_STORAGE_KEY, updated, WISHLIST_SCHEMA_VERSION);

    if (user) {
      fetch(`/api/wishlist/items/${productId}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data && Array.isArray(json.data.items)) {
            setItems(json.data.items);
            StorageAdapter.setItem(WISHLIST_STORAGE_KEY, json.data.items, WISHLIST_SCHEMA_VERSION);
          }
        })
        .catch(() => {});
    }
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
    StorageAdapter.setItem(WISHLIST_STORAGE_KEY, [], WISHLIST_SCHEMA_VERSION);

    if (user) {
      fetch('/api/wishlist', { method: 'DELETE' }).catch(() => {});
    }
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
        refreshWishlist,
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
