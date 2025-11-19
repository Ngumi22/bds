"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import { QuickViewDialog } from "./quick-view-dialog";
import { StockStatus } from "@prisma/client";
import { getActiveFlashSale } from "@/lib/utils/flash-sale";
import { formatCurrency } from "@/lib/utils/form-helpers";
import AddToCartButton from "./add-to-cart";
import { getProduct } from "@/lib/data/product-data";
import Image from "next/image";
import QuickBuy from "./whatsapp";
import { WishlistButtonSmall } from "./wishlist-button";
import Link from "next/link";
import { MinimalProductData } from "@/lib/product/product.types";

interface ProductCardProps {
  product: MinimalProductData;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

const stockStatusConfig: Record<StockStatus, { label: string; color: string }> =
  {
    IN_STOCK: { label: "In Stock", color: "bg-green-500/80" },
    LOW_STOCK: { label: "Low Stock", color: "bg-yellow-500/90" },
    OUT_OF_STOCK: { label: "Out of Stock", color: "bg-red-500/80" },
    BACKORDER: { label: "Backorder", color: "bg-blue-500" },
    DISCONTINUED: { label: "", color: "" },
  };

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [fullProduct, setFullProduct] = useState<any | null>(null);

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0;

  const activeFlashSale = getActiveFlashSale(product);
  const isFlashSale = !!activeFlashSale;

  const stockStatus = stockStatusConfig[product.stockStatus];

  const handleQuickView = async () => {
    setQuickViewOpen(true);
    if (!fullProduct) {
      const data = await getProduct(product.slug);
      setFullProduct(data);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-xs bg-white overflow-hidden transition-all duration-200 hover:shadow-xs">
      <div className="relative w-full aspect-square bg-background overflow-hidden p-2 flex items-center justify-center">
        <Image
          src={product.mainImage || "/head.jpg"}
          alt={product.slug}
          fill
          className="object-contain p-3 w-full h-full transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {activeFlashSale && (
            <div className="flex items-center gap-1 text-xs text-gray-900 bg-secondary p-1 rounded-xs">
              <span className="text-xs">Sale</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {hasDiscount && (
              <div className="text-gray-900 p-1 rounded-xs text-xs whitespace-nowrap bg-secondary">
                {discountPercent}% Off
              </div>
            )}
            {product.stockStatus === "LOW_STOCK" && (
              <div>
                {stockStatus.label && (
                  <div
                    className={`bg-secondary text-black  p-1 rounded-xs text-xs whitespace-nowrap`}>
                    {stockStatus.label}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="absolute right-1 top-2 flex flex-col items-center justify-center gap-2 sm:gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickView}
            className="text-black p-1.5 sm:p-2 cursor-pointer
              transition ease-in-out sm:delay-200 sm:group-hover:-translate-x-3 sm:hover:scale-110 sm:duration-300">
            <Eye className="h-7 w-7" strokeWidth={1} />
          </button>

          <WishlistButtonSmall product={product} />

          <QuickBuy product={product} />
        </div>
        {isFlashSale && activeFlashSale && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2  space-y-0.5 text-[10px] text-gray-600 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
            {activeFlashSale.endsAt && (
              <CountdownTimer endsAt={activeFlashSale.endsAt} />
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 bg-white flex items-center text-center flex-col gap-2 p-2 sm:transition-all sm:ease-in-out sm:duration-500 sm:group-hover:-translate-y-12">
        <p className="text-xs font-normal text-gray-600">{product.category}</p>
        <Link
          href={`/products/${product.slug}`}
          className="text-xs font-semibold line-clamp-2">
          {product.name}
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {product.originalPrice && formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-2 pt-0 sm:hidden">
        <AddToCartButton product={product} />
      </div>

      <div className="hidden sm:flex absolute bottom-0 left-0 w-full bg-white items-center justify-center opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out h-10 sm:h-12">
        <AddToCartButton product={product} />
      </div>

      {quickViewOpen && (
        <QuickViewDialog
          product={fullProduct}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      )}
    </div>
  );
}
