"use client";

import * as React from "react";
import { CartItem } from "../types";
import { Product, ProductVariant } from "@/features/catalog/types";
import { StorageAdapter } from "@/lib/storage/storage-adapter";
import { useAuth } from "@/features/auth/context/auth-context";

const CART_STORAGE_KEY = "veloce_cart_v1";
const CART_SCHEMA_VERSION = 1;

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotalMinor: number;
  isOpen: boolean;
  isHydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Fetch from server API
  const refreshCart = React.useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && Array.isArray(json.data.items)) {
          setItems(json.data.items);
          StorageAdapter.setItem(CART_STORAGE_KEY, json.data.items, CART_SCHEMA_VERSION);
          return;
        }
      }
    } catch {
      // Fall back to local storage
    }
  }, []);

  // Hydrate cart on mount
  React.useEffect(() => {
    const saved = StorageAdapter.getItem<CartItem[]>(CART_STORAGE_KEY, CART_SCHEMA_VERSION);
    if (saved && Array.isArray(saved)) {
      setItems(saved);
    }
    setIsHydrated(true);

    // Sync with server in background
    refreshCart();
  }, [refreshCart]);

  // Merge cart when user authenticates
  React.useEffect(() => {
    if (user && isHydrated) {
      fetch('/api/cart/merge', { method: 'POST' })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data && Array.isArray(json.data.items)) {
            setItems(json.data.items);
            StorageAdapter.setItem(CART_STORAGE_KEY, json.data.items, CART_SCHEMA_VERSION);
          }
        })
        .catch(() => {});
    }
  }, [user, isHydrated]);

  // Derived totals
  const totalItems = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotalMinor = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  /**
   * Add variant to cart with server synchronization
   */
  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    const primaryImage =
      product.media.find((m) => m.role === "PRIMARY")?.url ||
      product.media[0]?.url ||
      "";

    // 1. Optimistic local update
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.variantId === variant.id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(10, updated[existingIndex].quantity + quantity),
        };
        StorageAdapter.setItem(CART_STORAGE_KEY, updated, CART_SCHEMA_VERSION);
        return updated;
      }

      const newItem: CartItem = {
        id: `${product.id}-${variant.id}`,
        productId: product.id,
        variantId: variant.id,
        sku: variant.sku,
        productName: product.name,
        slug: product.slug,
        brandName: product.brand.name,
        primaryImage,
        selectedSize: variant.size,
        selectedColor: variant.color,
        unitPriceMinor: variant.priceMinor,
        compareAtPriceMinor: variant.compareAtPriceMinor,
        quantity: Math.min(10, quantity),
        currency: product.currency,
      };

      const updated = [...prevItems, newItem];
      StorageAdapter.setItem(CART_STORAGE_KEY, updated, CART_SCHEMA_VERSION);
      return updated;
    });

    setIsOpen(true);

    // 2. Server synchronization
    fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variantId: variant.id,
        productId: product.id,
        quantity,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && Array.isArray(json.data.items)) {
          setItems(json.data.items);
          StorageAdapter.setItem(CART_STORAGE_KEY, json.data.items, CART_SCHEMA_VERSION);
        }
      })
      .catch(() => {});
  };

  /**
   * Update item quantity with server synchronization
   */
  const updateQuantity = (variantId: string, quantity: number) => {
    const validQty = Math.max(1, Math.min(10, Math.floor(quantity)));

    // Optimistic update
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity: validQty } : item
      );
      StorageAdapter.setItem(CART_STORAGE_KEY, updated, CART_SCHEMA_VERSION);
      return updated;
    });

    // Server update
    fetch(`/api/cart/items/${variantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: validQty }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && Array.isArray(json.data.items)) {
          setItems(json.data.items);
          StorageAdapter.setItem(CART_STORAGE_KEY, json.data.items, CART_SCHEMA_VERSION);
        }
      })
      .catch(() => {});
  };

  /**
   * Remove item from cart with server synchronization
   */
  const removeItem = (variantId: string) => {
    // Optimistic update
    setItems((prev) => {
      const updated = prev.filter((item) => item.variantId !== variantId);
      StorageAdapter.setItem(CART_STORAGE_KEY, updated, CART_SCHEMA_VERSION);
      return updated;
    });

    // Server remove
    fetch(`/api/cart/items/${variantId}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && Array.isArray(json.data.items)) {
          setItems(json.data.items);
          StorageAdapter.setItem(CART_STORAGE_KEY, json.data.items, CART_SCHEMA_VERSION);
        }
      })
      .catch(() => {});
  };

  /**
   * Clear all items
   */
  const clearCart = () => {
    setItems([]);
    StorageAdapter.setItem(CART_STORAGE_KEY, [], CART_SCHEMA_VERSION);

    fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotalMinor,
        isOpen,
        isHydrated,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
