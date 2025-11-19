"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "./cart-sheet";
import { useCartStore } from "@/hooks/use-cart-store";

export default function CartButton() {
  const items = useCartStore((s) => s.items);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <span className="flex items-center justify-between space-x-2 relative cursor-pointer">
          <ShoppingCart size={30} strokeWidth={1.25} />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 left-4 h-4 w-4 rounded-full p-0 flex items-center justify-center text-sm bg-red-500 text-white">
              {totalItems}
            </Badge>
          )}
        </span>
      </SheetTrigger>
      <CartSheet />
    </Sheet>
  );
}
