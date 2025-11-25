"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/use-cart-store";
import { MinimalProductData } from "@/lib/product/product.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Eye, Loader2, ShoppingCart, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/form-helpers";

interface AddToCartButtonProps {
  product: MinimalProductData;
  quantity?: number;
  selectedVariants?: Record<string, string>;
  price?: number;
  mode?: "icon" | "default";
  className?: string;
  disabled?: boolean;
  isOutOfStock?: boolean;
  addOns?: any;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  selectedVariants = {},
  price,
  mode = "icon",
  className,
  disabled: disabledProp = false,
  isOutOfStock: isOutOfStockProp,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const addProductToCart = useCartStore((s) => s.addProductToCart);
  const cartItems = useCartStore((s) => s.items);

  const hasVariants =
    (product.hasVariants ||
      (product.colorVariants && product.colorVariants.length > 0)) &&
    Object.keys(selectedVariants).length === 0 &&
    mode === "icon";

  const isOutOfStock =
    isOutOfStockProp !== undefined
      ? isOutOfStockProp
      : product.stockStatus === "OUT_OF_STOCK";

  const isInCart =
    mounted &&
    cartItems.some((item) => item.productId === product.id && mode === "icon");

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    if (hasVariants) {
      router.push(`/products/${product.slug}`);
      return;
    }

    setLoading(true);
    try {
      await addProductToCart(
        {
          ...product,
          price: price || product.price,
        },
        quantity,
        selectedVariants
      );
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "icon") {
    const iconProps = { className: "w-4 h-4" };
    let Icon = ShoppingCart;
    let label = "Add to cart";
    let isDisabled = disabledProp;

    if (isOutOfStock) {
      Icon = XCircle;
      label = "Sold out";
      isDisabled = true;
    } else if (hasVariants) {
      Icon = Eye;
      label = "View options";
    } else if (isInCart) {
      Icon = Check;
      label = "In cart";
      isDisabled = true;
    } else if (loading) {
      Icon = Loader2;
      label = "Adding...";
    }

    return (
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        aria-label={label}
        className={cn(
          "flex items-center justify-center w-full h-full transition-colors",

          isOutOfStock
            ? "text-red-400 cursor-not-allowed opacity-50"
            : isInCart
            ? "text-green-400 cursor-default"
            : "text-white hover:bg-white/20",
          className
        )}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <span className="lg:hidden">
            <Icon {...iconProps} />
          </span>
        )}
        <span className="hidden lg:block text-xs font-semibold tracking-wider uppercase">
          {loading ? "Adding..." : label}
        </span>
      </button>
    );
  }
  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabledProp || isOutOfStock || loading}
      className={cn("flex-1 h-11 text-base ", className)}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}

      {loading ? "Adding..." : isOutOfStock ? "Out of Stock" : `Add to Cart`}
    </Button>
  );
}
