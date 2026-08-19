"use client";

import * as React from "react";
import { CartItem } from "../types";
import { Product, ProductVariant } from "@/features/catalog/types";
import { StorageAdapter } from "@/lib/storage/storage-adapter";

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
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate cart from StorageAdapter on client mount
  React.useEffect(() => {
    const saved = StorageAdapter.getItem<CartItem[]>(CART_STORAGE_KEY, CART_SCHEMA_VERSION);
    if (saved && Array.isArray(saved)) {
      setItems(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save changes to StorageAdapter whenever items state changes after hydration
  React.useEffect(() => {
    if (isHydrated) {
      StorageAdapter.setItem(CART_STORAGE_KEY, items, CART_SCHEMA_VERSION);
    }
  }, [items, isHydrated]);

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
   * Add a variant to cart with automatic deduplication & quantity merging
   */
  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    const primaryImage =
      product.media.find((m) => m.role === "PRIMARY")?.url ||
      product.media[0]?.url ||
      "";

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.variantId === variant.id);

      if (existingIndex > -1) {
        // Merge into existing line item
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      // Create new line item
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
        quantity,
        currency: product.currency,
      };

      return [...prevItems, newItem];
    });

    setIsOpen(true); // Open drawer for immediate feedback
  };

  /**
   * Update item quantity with minimum boundary of 1
   */
  const updateQuantity = (variantId: string, quantity: number) => {
    const validQty = Math.max(1, Math.floor(quantity));
    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity: validQty } : item
      )
    );
  };

  /**
   * Remove item from cart
   */
  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  /**
   * Clear all items
   */
  const clearCart = () => {
    setItems([]);
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
