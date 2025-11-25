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
              className={cn(
                "transition-colors h-3.5 w-3.5 md:h-5 md:w-5",
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

export function WishlistButtonSmall({
  product,
  className,
}: WishlistButtonProps) {
  return <WishlistAction product={product} className={className} />;
}

export const WishlistButtonFull = ({
  product,
  className,
}: WishlistButtonProps) => {
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
              "group flex flex-1 items-center justify-center w-full h-9 text-sm font-bold uppercase tracking-wide border border-black bg-white text-black hover:bg-black hover:text-white",
              className
            )}>
            <Heart
              className={cn(
                "transition-colors h-3.5 w-3.5 md:h-5 md:w-5",
                isInWishlist
                  ? "fill-red-500 text-red-500 group-hover:text-white group-hover:fill-white"
                  : "text-black group-hover:text-white"
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
