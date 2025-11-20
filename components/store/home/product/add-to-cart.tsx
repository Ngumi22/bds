"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/use-cart-store";
import { MinimalProductData } from "@/lib/product/product.types";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Check, Eye, ShoppingCart, XCircle } from "lucide-react";

interface AddToCartButtonProps {
  product: MinimalProductData;
  className?: string;
}

export default function AddToCartButton({
  product,
  className,
}: AddToCartButtonProps) {
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

  // Standardize icon size for mobile (w-4 h-4 matches other action bar icons)
  const iconProps = { className: "w-4 h-4" };

  let icon = <ShoppingCart {...iconProps} />;
  let label = "Add to cart";
  let onClick = handleAddToCart;
  let buttonClass = "";
  let disabled = false;

  if (isOutOfStock) {
    icon = <XCircle {...iconProps} />;
    label = "Sold out";
    onClick = () => {};
    disabled = true;
    buttonClass =
      "opacity-50 cursor-not-allowed hover:bg-transparent text-red-400";
  } else if (hasVariants) {
    icon = <Eye {...iconProps} />;
    label = "View options";
    onClick = () => router.push(`/products/${product.slug}`);
  } else if (isInCart) {
    icon = <Check {...iconProps} />;
    label = "In cart";
    onClick = () => {};
    disabled = true;
    buttonClass = "text-green-400 cursor-default hover:bg-transparent";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled && !isOutOfStock}
      aria-label={label}
      className={cn(
        "flex items-center justify-center w-full h-full text-white hover:bg-white/20 transition-colors",
        buttonClass,
        className
      )}>
      <span className="lg:hidden">{icon}</span>
      <span className="hidden lg:block text-xs font-semibold tracking-wider uppercase">
        {label}
      </span>
    </button>
  );
}
