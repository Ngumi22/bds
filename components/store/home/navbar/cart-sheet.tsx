"use client";

import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/form-helpers";
import Image from "next/image";
import { useCartStore } from "@/hooks/use-cart-store";

export function CartSheet() {
  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <SheetContent
      side="right"
      className="max-w-md md:min-w-lg p-0 bg-white h-screen max-h-screen overflow-hidden flex flex-col">
      <SheetHeader className="p-3 border-b border-gray-100 shrink-0">
        <SheetTitle className="flex items-center justify-between text-gray-900 text-xl font-semibold">
          Shopping Cart
          {cartItems.length > 0 && (
            <Badge className="bg-gray-800 hover:bg-gray-900 text-white rounded-xs mr-10">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </Badge>
          )}
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">
              Your cart is empty.
            </p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.key}
                className="flex gap-4 p-2 bg-gray-50 rounded-sm border border-gray-100">
                <Image
                  src={item.mainImage || "/placeholder.svg"}
                  alt={item.name}
                  height={100}
                  width={100}
                  className="w-16 h-16 object-cover rounded-sm shrink-0"
                />
                <div className="flex-1 space-y-2 min-w-0">
                  <h4 className="font-normal text-xs text-gray-900">
                    {item.name}
                  </h4>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      className="h-6 w-6 bg-white border-gray-200 hover:bg-gray-50 shrink-0"
                      onClick={() =>
                        updateQuantity(item.key, item.quantity - 1)
                      }>
                      <Minus className="h-3 w-3 text-gray-900" />
                    </Button>

                    <span className="w-6 text-center text-xs text-gray-900 shrink-0">
                      {item.quantity}
                    </span>

                    <Button
                      variant="outline"
                      className="h-6 w-6 bg-white border-gray-200 hover:bg-gray-50 shrink-0"
                      onClick={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }>
                      <Plus className="h-3 w-3 text-gray-900" />
                    </Button>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-gray-400 hover:text-red-600 shrink-0"
                  onClick={() => removeItem(item.key)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4 bg-white shrink-0">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-800">{formatCurrency(total)}</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button className="w-1/2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-sm">
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-1/2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-sm">
                View Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </SheetContent>
  );
}
