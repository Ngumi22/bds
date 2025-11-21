"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/hooks/use-cart-store";
import { useWishlistStore } from "@/hooks/use-wishlist-store";
import { ProductCard } from "@/components/shared/product-card";

export function WishlistContent() {
  const { items, clearAll, hasHydrated } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addProductToCart);

  const handleAddAllToCart = () => {
    if (!hasHydrated || items.length === 0) return;

    let addedCount = 0;
    let failedCount = 0;

    items.forEach((product) => {
      const result = addItemToCart(product, 1, {}, []);

      if (result.success) {
        addedCount++;
      } else {
        failedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success("Items Added to Cart", {
        description: `${addedCount} item(s) from your wishlist have been added to your cart.`,
        duration: 3000,
      });
    }
    if (failedCount > 0) {
      toast.warning("Some Items Not Added", {
        description: `${failedCount} item(s) could not be added (likely out of stock or failed validation).`,
        duration: 5000,
      });
    }
  };

  const handleClearWishlist = () => {
    if (items.length > 0) {
      clearAll();
    }
  };

  if (!hasHydrated) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl">
        <svg
          className="w-8 h-8 mx-auto text-blue-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 mt-4 font-medium">Loading wishlist...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <Heart className="w-16 h-16 mx-auto text-red-400/50 mb-4" />
        <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Your wishlist is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start adding products you love to save them for later.
        </p>
        <Button
          variant="outline"
          asChild
          className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Wishlist ({items.length})
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAddAllToCart}
            className="text-white bg-black border-black hover:bg-white hover:text-black transition">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add All to Cart
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearWishlist}
            className="transition">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} isLoaded={true} />
        ))}
      </div>
    </div>
  );
}
