"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/hooks/use-wishlist-store";
import { MinimalProductData } from "@/lib/product/product.types";

export function WishlistButtonSmall({
  product,
}: {
  product: MinimalProductData;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const wishlistItems = useWishlistStore((s) => s.items);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);

  const isInWishlist =
    mounted && wishlistItems.some((p) => p.id === product.id);

  const handleToggle = () => {
    if (isInWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative p-2 transition ease-in-out sm:delay-200 sm:group-hover:-translate-x-3 sm:hover:scale-110 sm:duration-400
        ${
          isInWishlist ? "bg-red-500 text-white hover:bg-red-600" : "text-black"
        }`}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}>
      <Heart
        strokeWidth={1}
        className={
          isInWishlist ? "text-white h-7 w-7" : "text-gray-700  h-7 w-7"
        }
      />
    </button>
  );
}

export function WishlistButtonFull({
  product,
}: {
  product: MinimalProductData;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const wishlistItems = useWishlistStore((s) => s.items);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);

  const isInWishlist =
    mounted && wishlistItems.some((p) => p.id === product.id);

  const handleToggle = () => {
    if (isInWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <Button
      onClick={handleToggle}
      className={`w-full md:w-[50%] rounded-xs mx-auto px-4 py-3 font-normal shadow-md transition ease-in-out sm:delay-200 sm:group-hover:-translate-x-3 sm:hover:scale-110 sm:duration-400
        ${
          isInWishlist
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white text-gray-900 border hover:bg-gray-100"
        }`}>
      <Heart
        size={18}
        className={`mr-2 ${isInWishlist ? "fill-white" : "fill-transparent"}`}
      />
      {isInWishlist ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}
    </Button>
  );
}
