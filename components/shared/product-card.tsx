"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, Star, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { MinimalProductData } from "@/lib/product/product.types";
import { formatCurrency } from "@/lib/utils/form-helpers";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddToCartButton from "../store/home/product/add-to-cart";
import { WishlistButtonSmall } from "../store/home/product/wishlist-button";
import QuickBuy from "../store/home/product/whatsapp";
import { useCallback, useState } from "react";
import { QuickViewDialog } from "./quick-view";

interface ProductCardProps {
  product: MinimalProductData;
  isLoaded?: boolean;
}

export function ProductCard({ product, isLoaded }: ProductCardProps) {
  const router = useRouter();

  const isSale =
    product.originalPrice !== null && product.originalPrice > product.price;
  const [showQuickView, setShowQuickView] = useState(false);

  const handleQuickView = useCallback(() => {
    setShowQuickView(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setShowQuickView(false);
  }, []);

  const DesktopActionBar = () => (
    <div className="hidden lg:flex items-center justify-between w-full h-10 bg-black divide-x divide-white/20">
      {product.hasVariants ? (
        <ActionButton
          icon={<Package className="h-3.5 w-3.5 md:h-5 md:w-5" />}
          label="View Options"
          onClick={handleQuickView}
          className="w-1/2 flex-none"
        />
      ) : (
        <AddToCartButton product={product} className="w-1/2 flex-none" />
      )}
      <ActionButton
        icon={<Eye className="h-3.5 w-3.5 md:h-5 md:w-5" />}
        label="Quick View"
        onClick={handleQuickView}
        className="flex-1"
      />
      <WishlistButtonSmall product={product} className="flex-1 w-full h-full" />
      <QuickBuy product={product} className="flex-1 w-full h-full" />
    </div>
  );

  const MobileActionBar = () => (
    <div className="flex lg:hidden items-center justify-between w-full h-8 md:h-10 bg-black divide-x divide-white/20">
      {product.hasVariants ? (
        <ActionButton
          icon={<Package className="h-3.5 w-3.5 md:h-5 md:w-5" />}
          label="View Options"
          onClick={() => router.push(`/products/${product.slug}`)}
          className="flex-1 w-full h-full"
        />
      ) : (
        <AddToCartButton product={product} className="flex-1 w-full h-full" />
      )}

      <WishlistButtonSmall product={product} className="flex-1 w-full h-full" />
      <QuickBuy product={product} className="flex-1 w-full h-full" />
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col bg-white border border-gray-200 overflow-hidden transition-opacity duration-300 hover:shadow-lg",
          isLoaded ? "opacity-100" : "opacity-0"
        )}>
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          {isSale && (
            <span className="absolute top-3 right-3 text-[10px] font-medium tracking-wider text-black bg-white px-2 py-1 z-10 shadow-sm">
              SALE
            </span>
          )}

          <Image
            src={product.mainImage || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            loading="lazy"
          />

          <div className="hidden lg:block absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
            <DesktopActionBar />
          </div>
        </div>

        <MobileActionBar />

        <div className="p-1 flex flex-col gap-2 border-t border-t-gray-200 ">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < (product.rating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>

          <h3
            className="text-sm font-medium text-black line-clamp-2 min-h-[2.5em]"
            title={product.name}>
            {product.name}
          </h3>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-1">
            {isSale && (
              <span className="text-xs text-gray-400 line-through decoration-gray-400">
                {product.originalPrice && formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="text-sm font-bold text-black">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
      </div>

      {showQuickView && (
        <QuickViewDialog
          product={product}
          open={showQuickView}
          onOpenChange={handleCloseQuickView}
        />
      )}
    </>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  showTooltip?: boolean;
}

const ActionButton = ({
  icon,
  label,
  onClick,
  className,
}: ActionButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "flex items-center justify-center w-full h-full text-white hover:bg-white/20 transition-colors flex-1",
            className
          )}
          aria-label={label}>
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export function EmptyCard() {
  return (
    <div className="relative flex flex-col bg-gray-50 border border-gray-200 overflow-hidden opacity-40">
      <div className="relative aspect-square w-full bg-gray-100" />
      <div className="block lg:hidden w-full h-10 bg-gray-200" />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-gray-200 text-gray-200" />
          ))}
        </div>
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}
