"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/use-cart-store";
import { Check } from "lucide-react";
import { MinimalProductData } from "@/lib/product/product.types";

interface AddToCartButtonProps {
  product: MinimalProductData;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const addProductToCart = useCartStore((s) => s.addProductToCart);
  const cartItems = useCartStore((s) => s.items);

  const hasVariants =
    product.hasVariants ||
    (product.colorVariants && product.colorVariants.length > 0);
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  const isInCart =
    mounted && cartItems.some((item) => item.productId === product.id);

  const handleAddToCart = () => {
    if (!isInCart) {
      addProductToCart(product, 1);
    }
  };

  if (isOutOfStock) {
    return (
      <Button
        variant="secondary"
        disabled
        className="md:w-[50%] flex items-center justify-center gap-2 opacity-70 cursor-not-allowed font-normal">
        SOLD OUT
      </Button>
    );
  }

  if (hasVariants) {
    return (
      <Button
        className="md:w-[50%] flex items-center rounded-xs mx-auto md:px-4 md:py-3 md:text-sm bg-gray-900 text-gray-100 transition-colors shadow-md font-normal text-xs px-2 py-1 cursor-pointer"
        onClick={() => router.push(`/products/${product.slug}`)}>
        VIEW OPTIONS
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isInCart}
      className={`w-full md:w-[50%] rounded-xs mx-auto  font-normal shadow-md transition-colors text-xs px-2 py-1
        ${
          isInCart
            ? "bg-green-600 text-white cursor-default"
            : "bg-gray-900 text-gray-100 hover:bg-gray-800"
        }`}>
      {isInCart ? (
        <>
          <Check size={16} />
          IN CART
        </>
      ) : (
        <>ADD TO CART</>
      )}
    </Button>
  );
}
