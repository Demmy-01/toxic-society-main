import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "../data/products";

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  isWishlisted: (id: number) => boolean;
  toggleItem: (product: Product) => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "ts_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const isWishlisted = useCallback(
    (id: number) => items.some((p) => p.id === id),
    [items]
  );

  const toggleItem = useCallback(
    (product: Product) => {
      if (items.find((p) => p.id === product.id)) {
        removeItem(product.id);
      } else {
        addItem(product);
      }
    },
    [items, addItem, removeItem]
  );

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, isWishlisted, toggleItem, totalItems: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
