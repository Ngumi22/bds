"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { StockStatus } from "@prisma/client";
import { MinimalProductData } from "@/lib/product/product.types";

export interface CartAddOn {
  key: string;
  name: string;
  price: number;
  description?: string;
}

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
  addOns: CartAddOn[];
  totalAddOnCost: number;
  finalPrice: number;
}

interface CartActionResult {
  success: boolean;
  message?: string;
}

interface CartStore {
  items: CartItem[];
  hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  addProductToCart: (
    product: MinimalProductData,
    quantity?: number,
    variants?: Record<string, string>,
    addOns?: CartAddOn[]
  ) => CartActionResult;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => CartActionResult;
  clearCart: () => void;

  isInCart: (
    productId: string,
    variants?: Record<string, string>,
    addOns?: CartAddOn[]
  ) => boolean;
  getCartTotal: () => number;
  getTotalItems: () => number;
}

export const calculateItemFinalPrice = (
  basePrice: number,
  addOns: CartAddOn[]
): { finalPrice: number; totalAddOnCost: number } => {
  const totalAddOnCost = addOns.reduce((sum, addOn) => sum + addOn.price, 0);
  return {
    finalPrice: basePrice + totalAddOnCost,
    totalAddOnCost,
  };
};

export function generateCartKey(
  productId: string,
  variants?: Record<string, string>,
  addOns: CartAddOn[] = []
): string {
  const variantKey = Object.entries(variants || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, value]) => `${type}=${value}`)
    .join("&");

  const addOnKey = addOns
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((ao) => ao.key)
    .join("+");

  let key = productId;
  if (variantKey) key += `-${variantKey}`;
  if (addOnKey) key += `-[AOS-${addOnKey}]`;

  return key;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },

      addProductToCart: (product, quantity = 1, variants = {}, addOns = []) => {
        if (product.stockStatus === "OUT_OF_STOCK") {
          toast.error("Out of Stock", {
            description: `${product.name} is currently unavailable.`,
          });
          return { success: false, message: "Out of stock" };
        }

        const { finalPrice, totalAddOnCost } = calculateItemFinalPrice(
          product.price,
          addOns
        );

        const key = generateCartKey(product.id, variants, addOns);
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex((i) => i.key === key);

        let updatedItems = [...currentItems];

        if (existingItemIndex > -1) {
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };
          toast.success("Cart Updated", {
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
            addOns,
            totalAddOnCost,
            finalPrice,
          };
          updatedItems.push(newItem);
          toast.success("Item Added", {
            description: `${product.name} added to your cart.`,
          });
        }

        set({ items: updatedItems });
        return { success: true };
      },

      removeItem: (key) => {
        const currentItems = get().items;
        const updatedItems = currentItems.filter((i) => i.key !== key);

        if (currentItems.length !== updatedItems.length) {
          set({ items: updatedItems });
          toast.info("Item Removed", {
            description: "Item removed from cart.",
          });
        }
      },

      updateQuantity: (key, quantity) => {
        const currentItems = get().items;
        const itemIndex = currentItems.findIndex((i) => i.key === key);

        if (itemIndex === -1) return { success: false, message: "Not found" };

        if (quantity <= 0) {
          const updatedItems = currentItems.filter((i) => i.key !== key);
          set({ items: updatedItems });
          return { success: true };
        }

        const updatedItems = [...currentItems];
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity };

        set({ items: updatedItems });
        return { success: true };
      },

      clearCart: () => {
        set({ items: [] });
        toast.info("Cart Cleared");
      },

      isInCart: (productId, variants = {}, addOns = []) => {
        const key = generateCartKey(productId, variants, addOns);
        return get().items.some((i) => i.key === key);
      },

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.finalPrice * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({ items: state.items }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
