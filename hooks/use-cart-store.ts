"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { StockStatus } from "@prisma/client";
import { MinimalProductData } from "@/lib/product/product.types";

// 🧩 Key generator for products with variants
export function generateCartKey(
  productId: string,
  variants?: Record<string, string>
): string {
  if (!variants || Object.keys(variants).length === 0) return productId;
  const variantKey = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, value]) => `${type}=${value}`)
    .join("&");
  return `${productId}-${variantKey}`;
}

// 🧱 Cart Item Type
export interface CartItem {
  key: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  mainImage: string;
  quantity: number;
  stockStatus: StockStatus;
  variants?: Record<string, string>;
  categoryId: string;
}

interface CartActionResult {
  success: boolean;
  message?: string;
}

interface CartStore {
  items: CartItem[];
  hasHydrated: boolean;
  totalItems: number;
  setHasHydrated: (value: boolean) => void;
  _hasHydrated: boolean;
  addProductToCart: (
    product: MinimalProductData,
    quantity?: number,
    variants?: Record<string, string>
  ) => CartActionResult;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => CartActionResult;
  clearCart: () => void;
  isInCart: (productId: string, variants?: Record<string, string>) => boolean;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      totalItems: 0,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },

      addProductToCart: (product, quantity = 1, variants = {}) => {
        if (product.stockStatus === "OUT_OF_STOCK") {
          toast("Out of Stock", {
            description: `${product.name} is currently unavailable.`,
          });
          return { success: false, message: "Out of stock" };
        }

        const key = generateCartKey(product.id, variants);
        const existing = get().items.find((i) => i.key === key);

        let updatedItems;

        if (existing) {
          const newQty = existing.quantity + quantity;
          updatedItems = get().items.map((i) =>
            i.key === key ? { ...i, quantity: newQty } : i
          );
          toast("Cart Updated", {
            description: `${product.name} quantity increased.`,
          });
        } else {
          const newItem: CartItem = {
            key,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            mainImage: product.mainImage,
            quantity,
            stockStatus: product.stockStatus,
            variants,
            categoryId: product.categoryId,
          };
          updatedItems = [...get().items, newItem];
          toast("Item Added", {
            description: `${product.name} was added to your cart.`,
          });
        }

        set({
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        });

        return { success: true };
      },

      removeItem: (key) => {
        const updatedItems = get().items.filter((i) => i.key !== key);
        set({
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        });
        toast("Item Removed", {
          description: "The item was removed from your cart.",
        });
      },

      updateQuantity: (key, quantity) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return { success: false, message: "Not found" };

        let updatedItems;
        if (quantity <= 0) {
          updatedItems = get().items.filter((i) => i.key !== key);
        } else {
          updatedItems = get().items.map((i) =>
            i.key === key ? { ...i, quantity } : i
          );
        }

        set({
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        });

        toast("Quantity Updated", {
          description: `${item.name} quantity updated.`,
        });

        return { success: true };
      },

      clearCart: () => {
        set({ items: [], totalItems: 0 });
        toast("Cart Cleared");
      },

      isInCart: (productId, variants = {}) => {
        const key = generateCartKey(productId, variants);
        return get().items.some((i) => i.key === key);
      },

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
