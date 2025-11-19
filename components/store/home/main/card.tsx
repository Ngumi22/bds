"use client";

import { MinimalProductData } from "@/lib/product/product.types";
import { Heart, Eye } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

// Assuming MinimalProductData is imported correctly.
// The interface uses the 'extends' keyword and is defined without '='
export interface ProductCardProps extends MinimalProductData {
  // New properties specific to the card component
  isSale?: boolean;
  onQuickAdd?: (productId: string) => void;
  onLike?: (productId: string) => void;
  onView?: (productId: string) => void;
}

export default function ProductCard({
  id,
  mainImage,
  brand,
  name,
  category,
  originalPrice,
  price,
  colorVariants,
  isSale = false,
  onQuickAdd,
  onLike,
  onView,
}: ProductCardProps) {
  const colorElements = useMemo(
    () =>
      colorVariants?.map((color) => (
        <div
          key={
            color.name ?? color.value ?? color.color ?? Math.random().toString()
          }
          className="w-4 h-4 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
          style={{ backgroundColor: color.color ?? color.value ?? "#fff" }}
          title={color.name ?? color.color ?? color.value ?? ""}
        />
      )),
    [colorVariants]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0 w-full transition-all duration-300 hover:shadow-lg group">
      {/* Image Container */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        <Image
          src={mainImage || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isSale && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            Sale
          </div>
        )}

        {/* Icon Overlays */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView?.(id)}
            className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="View product">
            <Eye size={20} className="text-gray-800" />
          </button>
          <button
            onClick={() => onLike?.(id)}
            className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Add to favorites">
            <Heart size={20} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500 font-medium">{brand}</p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 text-pretty">
            {name}
          </h3>
          <p className="text-xs text-gray-600 mt-1">{category}</p>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2">
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-sm font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
        </div>

        {/* Colors */}
        <div className="flex gap-2">{colorElements}</div>

        {/* Action Button */}
        <button
          onClick={() => onQuickAdd?.(id)}
          className="w-full py-2.5 border-2 border-gray-900 text-gray-900 font-semibold text-sm rounded transition-colors duration-200 hover:bg-gray-900 hover:text-white">
          QUICK ADD
        </button>
      </div>
    </div>
  );
}
