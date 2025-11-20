"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/hooks/use-wishlist-store";
import { MinimalProductData } from "@/lib/product/product.types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WishlistButtonProps {
  product: MinimalProductData;
  className?: string;
}

const WishlistAction = ({ product, className }: WishlistButtonProps) => {
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

  const label = isInWishlist ? "Remove from wishlist" : "Add to wishlist";

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            aria-label={label}
            className={cn(
              "flex items-center justify-center w-full h-full text-white hover:bg-white/20 transition-colors",
              className
            )}>
            <Heart
              size={20}
              className={cn(
                "transition-colors",
                isInWishlist ? "fill-red-500 text-red-500" : "text-white"
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function WishlistButtonSmall({ product }: WishlistButtonProps) {
  return <WishlistAction product={product} />;
}

export function WishlistButtonFull({ product }: WishlistButtonProps) {
  return <WishlistAction product={product} />;
}
