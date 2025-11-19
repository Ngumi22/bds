"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { MinimalProductData } from "@/lib/product/product.types";

interface WishlistStore {
  items: MinimalProductData[];
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
        const itemToRemove = get().items.find((p) => p.id === productId);
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }));
        if (itemToRemove) {
          toast("Removed from Wishlist", {
            description: `${itemToRemove.name} has been removed from your wishlist.`,
          });
        }
      },

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
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
        toast("Wishlist Cleared");
      },
    }),
    {
      name: "wishlistStore",
    }
  )
);
