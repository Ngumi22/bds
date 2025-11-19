"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface StickyAddToCartProps {
  product: {
    name: string;
    price: number;
    images: string[];
    inStock: boolean;
  };
  currentVariantPrice?: number;
  selectedVariants?: Record<string, string>;
}

export function StickyAddToCart({
  product,
  currentVariantPrice,
  selectedVariants,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayPrice = currentVariantPrice || product.price;

  const handleAddToCart = () => {
    const cartItem = {
      productName: product.name,
      basePrice: product.price,
      selectedVariants: selectedVariants,
      variantPrice: displayPrice,
      quantity: 1,
      totalPrice: displayPrice,
    };
    console.log("[v0] Adding to cart from sticky bar:", cartItem);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-3 shadow-lg sm:p-4 lg:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 sm:gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-border sm:h-12 sm:w-12">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {product.name}
          </p>
          <p className="text-sm font-semibold text-foreground">
            ${displayPrice.toFixed(2)}
          </p>
        </div>
        <Button
          size="lg"
          disabled={!product.inStock}
          className="shrink-0 text-xs sm:text-sm"
          onClick={handleAddToCart}>
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Add to Cart</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
}
