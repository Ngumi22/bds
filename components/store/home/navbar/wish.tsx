"use client";

import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/hooks/use-wishlist-store";

export default function WishButton() {
  const items = useWishlistStore((s) => s.items);
  const totalItems = items.length;

  return (
    <div className="relative hidden sm:flex items-center space-x-2 cursor-pointer">
      <Heart className="relative" size={30} strokeWidth={1.25} />

      {totalItems > 0 && (
        <Badge className="absolute -top-2 left-4 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
          {totalItems}
        </Badge>
      )}
    </div>
  );
}
