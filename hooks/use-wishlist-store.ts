"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { MinimalProductData } from "@/lib/product/product.types";

interface WishlistStore {
  items: MinimalProductData[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addItem: (product: MinimalProductData) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: MinimalProductData) => void;
  isInWishlist: (productId: string) => boolean;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },

      addItem: (product) => {
        if (get().isInWishlist(product.id)) return;

        set((state) => ({
          items: [...state.items, product],
        }));

        toast("Added to Wishlist", {
          description: `${product.name} has been added to your wishlist.`,
        });
      },

      removeItem: (productId) => {
        const currentItems = get().items;
        const itemToRemove = currentItems.find((p) => p.id === productId);

        set(() => ({
          items: currentItems.filter((p) => p.id !== productId),
        }));

        if (itemToRemove) {
          toast("Removed from Wishlist", {
            description: `${itemToRemove.name} has been removed from your wishlist.`,
          });
        }
      },

      toggleItem: (product) => {
        const isIn = get().isInWishlist(product.id);
        if (isIn) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((p) => p.id === productId);
      },

      clearAll: () => {
        set({ items: [] });
        toast("Wishlist Cleared", {
          description: "All items have been removed.",
        });
      },
    }),
    {
      name: "wishlistStore",
      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: (state) => {
        if (state) {
          setTimeout(() => state.setHasHydrated(true), 100);
        }
      },
    }
  )
);
